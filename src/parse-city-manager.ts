import { CronJob } from 'cron';
import { Job } from "bull";
import { ParserQueueJobData, parserQueue } from './domains/queues/parserQueue'; 
import { initDatabase } from "./db/init-db"
import { SiteParser } from "./domains/parser"
import { sendMessageQueue, sendMessageQueueJobData } from './domains/queues/sendTelegramMessageQueue';
import { TelegramBot } from './domains/telegram-bot';
import { Config } from './domains/config/dot-env';
import { UserModel } from './db/user';
import { createAdMessageById } from './createAdMessage';

const bot = new TelegramBot(Config.telegramApiToken);
let startPage = 2;

async function startManager(pageNumber: number, stopPage: number) {
    try{
        const queueCount = await parserQueue.count();
        if (queueCount === 0) {
            console.log('Queue is empty. Adding task to queue.');
            const cities = ['almaty', 'astana', 'shymkent'];
            let j = 0;
            let count = 0;
            for(let i = pageNumber; i<=stopPage; i++){
                await parserQueue.add(
                    {
                        city: cities[j],
                        pageNumber: i
                    }
                );
                console.log(`Adding queue for ${cities[j]} - Page ${i}`);
                
                if(i === stopPage && count < cities.length-1 ){
                    i = pageNumber-1;
                    j++;
                    count++;
                    console.log('\n');
                }
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
            if(response.data.length === 0 && response?.page !== 0) {
                startPage = response?.page;
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
            }
        }
        console.log(`Processed job for ${city} - Page ${pageNumber}`);
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
        if(startPage <= 5){
            startManager(startPage, startPage+5);
            startPage += 6;
        }else{
            startManager(startPage, startPage+5);
            startPage += 6;
        }
        console.log("\nSSS");
	},
    null,
    true
);