import Queue, { QueueOptions } from "bull";
import { Config } from "../../config/dot-env";

export type sendMessageQueueJobData = {
  chatId: string;
  message: string;
};

const redisUrl = Config.redisUrl;

const sendMessageQueueOptions: QueueOptions = {
  redis: redisUrl,
};
export const sendMessageQueue = new Queue<sendMessageQueueJobData>("send-message-queue", sendMessageQueueOptions);