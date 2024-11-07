type ConfigType = {
	mainMongoConnectionUrl: string;
	telegramApiToken: string;
	redisUrl: string;
};

export const Config: ConfigType = {
	mainMongoConnectionUrl: "mongodb://localhost:27017/scrapper",
	telegramApiToken: "",
	redisUrl: "redis://127.0.0.1:6379",
};
