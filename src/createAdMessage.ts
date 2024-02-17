import { ArticleData, FindOneParsedDataType, SaveParsedDataType } from "./data/article";
import { SiteParser } from "./domains/parser";
import { adMessageTemplate } from "./message-template";

export const createAdMessageById = async (id: string): Promise<string> => {
    let message: string = "";
    const findType: FindOneParsedDataType = {id: parseInt(id)};
    const article = await ArticleData.findOne(findType);
    if (!article) {
        const newArticle = await SiteParser.parseId(id);
        if (!newArticle) {
            message = "Объявление не найдено";
        } else if (newArticle) {
            const saved: SaveParsedDataType | null = await ArticleData.save(newArticle);
            if (saved) {
                message = adMessageTemplate(saved);
            }
        }
    } else {
        message = adMessageTemplate(article);
    }
    return message;
};