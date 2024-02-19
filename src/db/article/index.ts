import { Schema, Document } from "mongoose";
import { MongoDataBase } from "../";

const COLLECTION_NAME = 'Article';

export interface IArticle extends Document {
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
}

const ArticleSchema = new Schema <IArticle>({
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    baseUrl: { type: String, required: true },
    address: { type: String, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    buildingType: { type: String, },
    yearBuilt: { type: Number },
    floor: { type: Number },
    floorMax: { type: Number },
    toilet: { type: String },
    area: { type: Number, required: true },
    rooms: { type: Number, required: true },
    security: { type: String, default: ''},
    description: { type: String, default: '' },
}, 
{
    timestamps: true,
    collection: COLLECTION_NAME,
});

ArticleSchema.index( {id: 1} )

export const ArticleModel = MongoDataBase.mainDataBaseConnection.model<IArticle>(COLLECTION_NAME, ArticleSchema, COLLECTION_NAME);