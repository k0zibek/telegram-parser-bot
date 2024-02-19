import { CronJob } from 'cron';
import { Job } from "bull";
import { ParserQueueJobData, parserQueue } from './domains/queues/parserQueue'; 
import { initDatabase } from "./db/init-db"
import { SiteParser } from "./domains/parser"
import { TelegramBot } from './domains/telegram-bot';
import { Config } from './domains/config/dot-env';
import { UserModel } from './db/user';
import { createAdMessageById } from './createAdMessage';

const bot = new TelegramBot(Config.telegramApiToken);
let firstStart = 2;
let startPageSh = firstStart;
let startPageAs = firstStart;
let startPageAl = firstStart;

async function startManager(city: string, pageNumber: number, stopPage: number) {
    try{
        const queueCount = await parserQueue.count();
        if (queueCount === 0) {
            console.log('Queue is empty. Adding task to queue.');
            for(let i = pageNumber; i<stopPage; i++){
                await parserQueue.add(
                    {
                        city: city,
                        pageNumber: i
                    }
                );
                console.log(`Adding queue for ${city} - Page ${i}`);
            }

        } else {
          console.log('Queue is not empty. Skipping job addition.');
        }
    }catch(error){
        console.error('Error checking queue count:', error);
    }
};

parserQueue.process(async (job: Job<ParserQueueJobData>, done) => {
    try {
        const city: string = job.data.city;
        const pageNumber: number = job.data.pageNumber;
        const response = await SiteParser.multiPageParse(city, pageNumber, 50);
        if(response !== null) {
            if(response.data.length === 0 && response.pageCity[0].page !== 0) {
                startPageSh = response.pageCity[0].page;
            }
            if(response.data.length === 0 && response.pageCity[1].page !== 0){
                startPageAs = response.pageCity[1].page;
            }
            if(response.data.length === 0 && response.pageCity[2].page !== 0){
                startPageAl = response.pageCity[2].page;
            }
            else {
                const allUsers = await UserModel.find();
                for(let i = 0; i < response.data.length; i++){
                    const message = await createAdMessageById(String(response.data[i].id));
                    for(let j = 0; j < allUsers.length; j++) {
                        console.log('Sending message to user', allUsers[j].firstName)
                        await bot.sendMessage(parseInt(allUsers[j].chatId), message);
                    }
                }
                response.data = [];
            }
        }
        console.log(`\nProcessed job for ${city} - Page ${pageNumber}`);
        done(null, response);
    } catch (error: any) {
        console.log(error);
        done(new Error(error));
    } finally {
        done();
    }
});

parserQueue.on('error', (error) => {
    console.error('Queue error:', error);
});

initDatabase().then();

export const initJob = new CronJob(
    '* * * * *',
	async function () {
        startManager('shymkent', startPageSh, startPageSh+5);
        startPageSh += 5;
        
        startManager('astana', startPageAs, startPageAs+5);
        startPageAs += 5;
        
        startManager('almaty', startPageAl, startPageAl+5);
        startPageAl += 5;
        console.log("\nSSS");
	},
    null,
    true
);