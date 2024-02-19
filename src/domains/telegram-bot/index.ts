import { Context, Markup, Telegraf } from 'telegraf'
import { UserData } from '../../data/user'

export class TelegramBot {
    private bot: Telegraf<Context>;

    constructor(apiToken: string) {
        this.bot = new Telegraf(apiToken)
    }

    public init() {
        const commands = [
            { command: 'help', description: 'Что делает этот бот' },
            { command: 'stop', description: 'Остановить бота' },
        ];
        
        // try {
        //     this.bot.telegram.setChatMenuButton({
        //         chatId: 
        //     });
        //     console.log('Пользовательские команды установлены');
        // } catch (error) {
        //     console.error('Ошибка при установке пользовательских команд:', error);
        // }

        this.bot
            .launch()
            .then(() => {
                console.log('Бот успешно запущен.');
            }).catch((error) => {
                console.error('Ошибка при запуске бота:', error);
            });
        this.bot
            .command('start', async (ctx) => {
            this.bot.telegram.sendMessage(ctx.chat.id, `Здравствуйте ${ctx.from.first_name}! Ожидайте идет поиск свежих объявлений🔎`);
            if(!await UserData.findOne({ 
                chatId: String(ctx.from.id) 
            })) {
                await UserData.save({
                    firstName: ctx.from.first_name,
                    username: ctx.from.username !== undefined ? ctx.from.username : '',
                    chatId: String(ctx.from.id)
                });
            }
        });
        this.bot
            .command('stop', () => {
                console.log('Бот остановлен');
                this.bot.stop('SIGINT');
            });
        this.bot
            .command('help', async (ctx) => {
                this.bot.telegram.sendMessage(ctx.chat.id,
                    `Бот каждую минуту отправляет вам новые объявления в krisha.kz в городах Астана, Алматы и Шымкент`);
            });
    }

    async sendMessage(chatId: number, message: string): Promise<void> {
        try {
            await this.bot.telegram.sendMessage(chatId, message);
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
        }
    }

    getMessage(callback: (ctx: Context) => void): void {
        this.bot.on('message', callback);
    }
}
