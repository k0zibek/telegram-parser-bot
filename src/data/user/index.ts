import { IUser, UserModel } from '../../db/user/index.js';

export type SaveUserType = {
    firstName?: string
    username?: string
    chatId: string
}

export type FindOneUserOptionsType = {
    chatId: string
}

export class UserData {
    public static async save(data: SaveUserType): Promise<IUser> {
        return new UserModel(data).save();
    }
    
    public static async findOne(findOne: FindOneUserOptionsType): Promise<IUser | null> {
        return UserModel.findOne(findOne);
    }
}