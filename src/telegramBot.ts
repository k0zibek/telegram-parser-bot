import { Config } from "./domains/config/dot-env";
import { SiteParser } from "./domains/parser";
import { TelegramBot } from "./domains/telegram-bot";
import { initJob } from "./parse-city-manager";

const start = async (): Promise<void> => {
    const bot = new TelegramBot(Config.telegramApiToken);
    bot.init()
}

start()
    .then( () => {
        console.log('Application started successfully.'); 
    })
    .catch((error) => {
        console.error('Error starting the application:', error);
    });

initJob;