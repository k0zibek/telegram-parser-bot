const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const { Telegraf } = require('telegraf');

const bot = new Telegraf('6678580790:AAFzM0GRDl1FVJqKXA-PBRZw2Rg3jCOFA4Y', {});

mongoose.connect("mongodb://localhost:27017/scrapper");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true},
    chatId: { type: Number, required: true}
})
const User = mongoose.model('User', userSchema);

const articleSchema = new mongoose.Schema({
    title: { type: String, required: true},
    baseUrl: { type: String, required: true},
    owner: { type: String, required: true},
    price: { type: Number, required: true},
    location: { type: String, required: true},
    floor: { type: Number, required: true},
    area: { type: String, required: true},
    condition: { type: String, required: true},
    furnished: { type: Boolean, required: true},
    furnitures: { type: String, required: true},
    facilities: { type: String, required: true},
    security: { type: String, required: true},
    descritption: { type: String, required: true}
})
const Article = mongoose.model('Article', articleSchema);

async function scrapeAndSave(adId, first_name) {
  try {
    let baseUrl = `https://krisha.kz/a/show/${adId}`;
    const existingArticle = await Article.findOne({baseUrl});

    const response = await axios.get(baseUrl);
    const $ = cheerio.load(response.data);

    const title = $('.offer__advert-title h1').text().trim();
    
    const priceText = $('div.offer__price').text();
    const price = parseInt(priceText.replace(/\D/g, ''));

    const location = $('.offer__advert-short-info span').text().trim();
    const floor = parseInt($('div[data-name="flat.floor"] .offer__advert-short-info').text());
    const area = $('div[data-name="live.square"] .offer__advert-short-info').text().trim();
    const condition = $('div[data-name="flat.rent_renovation"] .offer__advert-short-info').text().trim();
    const furnished = $('div[data-name="live.furniture"] .offer__advert-short-info').text().trim() ? 1: 0;
    const furnitures = $('.offer__parameters dl dd').eq(0).text().trim();
    const facilities = $('.offer__parameters dl dd').eq(1).text().trim();
    const security = $('div[data-name="flat.security"] .offer__advert-short-info').text().trim();
    const descritption = $('.a-text-white-spaces').text().trim();
    const owner = $('.owners__name').text().trim();

    const article = new Article({ 
      title, 
      baseUrl,
      owner,
      price,
      location,
      floor,
      area, 
      condition,
      furnished,
      furnitures,
      facilities,
      security,
      descritption 
    });

    if(existingArticle){
      console.log('\nТакое объявление уже есть в базе данных!');
      await bot.telegram.sendMessage(first_name, `
        ${title},
        ${baseUrl}
        Такое объявление уже есть в базе данных!
        Если хотите спарсить еще одно объявление оптравьте id объявления`);
    }else{
      await article.save();
      console.log(article.toJSON());
      console.log('\nПарсинг завершен и данные сохранены в базе данных!');
      await bot.telegram.sendMessage(first_name,
        `
        ${title},
        ${baseUrl}
        Парсинг завершен и данные сохранены в базе данных!\n Если хотите спарсить еще одно объявление оптравьте id объявления`);
    }
  } catch (error) {
    console.error('Произошла ошибка при парсинге и сохранении данных:', error);
    await bot.telegram.sendMessage(first_name, 
      `Произошла ошибка при парсинге и сохранении данных. Пожалуйста проверьте правильность данных`);
  }
}

bot.start(async (ctx) => {
  const { id, first_name } = ctx.from;
  try {
    const existingUser = await User.findOne({name: first_name,  chatId: id });
    if(existingUser){
      await ctx.reply(`С возвращением! ${first_name}`);
    }else{
      const newUser = new User({ name: first_name, chatId: id });
      await newUser.save();
      await ctx.reply(`
          Добро пожаловать, ${first_name}! Я вас запомнил)\n Напишите id объявления чтобы спарсить сайт
      `);
    }
  } catch (err) {
    mongoose.disconnect()
    console.log(err);
  }
});

bot.catch(err => {
  mongoose.disconnect()
  console.warn(err)
});

bot.help((ctx) => {
  ctx.reply(`
    Это помощь. Доступные команды:
      /start - Запустить бот
      /stop - Завершить бот
    `);
});

bot.on('message', async (ctx) => {
  await scrapeAndSave(ctx.message.text, ctx.from.id);
})

bot.launch()

console.log('Бот запущен');

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))