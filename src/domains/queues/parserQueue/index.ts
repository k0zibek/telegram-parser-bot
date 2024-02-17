import { Config } from "../../config/dot-env";
import Queue, { QueueOptions } from "bull";

export type ParserQueueJobData = {
    city: string;
    pageNumber: number;
};

const redisUrl = Config.redisUrl;

const parserQueueOptions: QueueOptions = {
    redis: redisUrl,
};
export const parserQueue = new Queue<ParserQueueJobData>("parser-queue", parserQueueOptions);