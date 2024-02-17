import { Types } from 'mongoose';
import { ArticleModel, IArticle } from '../../db/article/index.js';

export type SaveParsedDataType = {
    id: number;
    title: string;
    baseUrl: string;
    address: string;
    price: number;
    location: string;
    buildingType: string;
    yearBuilt: number;
    floor: number;
    floorMax: number;
    toilet: string;
    area: number;
    rooms: number;
    security: string;
    description: string;
    pageUrl: string;
};

export type FindOneParsedDataType = 
    | {
        id: number
      }
    | {
        _id: Types.ObjectId
    };

export class ArticleData {
    public static async save(data: SaveParsedDataType): Promise<IArticle>{
        return new ArticleModel(data).save();
    }

    public static async findOne(findOne: FindOneParsedDataType): Promise<IArticle | null>{
        return ArticleModel.findOne(findOne);
    }
};