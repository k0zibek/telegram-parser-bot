import { MongoDataBase } from '.';

export const initDatabase = async (): Promise<void> => {
    await MongoDataBase.initMainDataBaseConnection()
}