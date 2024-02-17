type ConfigType = {
    mainMongoConnectionUrl: string
    telegramApiToken: string
    redisUrl: string
}

export const Config: ConfigType = {
    mainMongoConnectionUrl: 'mongodb://localhost:27017/scrapper',
    telegramApiToken: '6678580790:AAFzM0GRDl1FVJqKXA-PBRZw2Rg3jCOFA4Y',
    redisUrl: 'redis://127.0.0.1:6379'
}