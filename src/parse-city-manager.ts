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
let stopPage = startPage + 5;
let articleFound: boolean;

async function startManager(pageNumber: number, stopPage: number) {
    try{
        const queueCount = await parserQueue.count();
        if (queueCount === 0) {
            console.log('Queue is empty. Adding task to queue.');
            const cities = ['almaty', 'astana', 'shymkent'];
            for (const city of cities) {
                console.log(city);
                while (pageNumber <= stopPage) {
                    await parserQueue.add(
                        {
                            city,
                            pageNumber
                        },
                        {
                            removeOnComplete: true, 
                            removeOnFail: true
                        }
                    );
                    pageNumber++;
                    console.log(parserQueue);
                };
            };
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
        // console.log(response);
        if( response?.length === 0 ) {
            articleFound = false;
        } else {
            if(response !== null) {
                for(let i = 1; i < response.length; i++){
                    const message = await createAdMessageById(String(response[i].id));
                    const allUsers = await UserModel.find();
                    for(let j = 0; j < allUsers.length; j++) {
                        console.log('Sending message to user ', allUsers[j].firstName)
                        await bot.sendMessage(parseInt(allUsers[j].chatId), message);
                    }
                }
            }
        }
        done(null)
    } catch (error: any) {
        console.log(error);
        done(new Error(error));
    } finally {
        done();
    }
});

initDatabase().then();

export const initJob = new CronJob(
    '* * * * *',
	async function () {
        if(!articleFound){
            startManager(startPage+5, stopPage+5);
        }else{
            startManager(startPage-5, startPage+5);
        }
        console.log("\nSSS");
	},
    null,
    true
);