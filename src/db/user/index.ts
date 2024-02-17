import { Schema, Document } from "mongoose";
import { MongoDataBase } from "..";

const COLLECTION_NAME = 'User';

export interface IUser extends Document {
    firstName: string;
    userName: string;
    chatId: string;
}

const UserSchema: Schema = new Schema(
    {
        firstName: { type: String, default: '' },
        userName: { type: String, default: '' },
        chatId: { type: String, required: true, unique: true },
    }
);

UserSchema.index({ chatId: 1 })

export const UserModel = MongoDataBase.mainDataBaseConnection.model<IUser>(COLLECTION_NAME, UserSchema, COLLECTION_NAME);