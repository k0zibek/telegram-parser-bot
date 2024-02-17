import { Mongoose } from 'mongoose'
import { Config } from '../domains/config/dot-env'

export class MongoDataBase {
    public static mainDataBaseConnection: Mongoose = new Mongoose()
    public static async initMainDataBaseConnection(): Promise<void> {
        console.log(`Trying to connect to ${Config.mainMongoConnectionUrl}`)

        return MongoDataBase.mainDataBaseConnection
            .connect(Config.mainMongoConnectionUrl)
            .then(() => console.log(`Connected to ${Config.mainMongoConnectionUrl}`))
            .catch((error) => {
                console.log(`Couldn't connect to ${Config.mainMongoConnectionUrl}`)
                throw error
            })
    }
}