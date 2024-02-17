import axios from 'axios';
import * as cheerio from 'cheerio';

interface ParsedData {
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
}

function getRandomDelay() {
    return Math.floor(Math.random() * 1000) + 500;
};

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
};

export class SiteParser{
    public static async parseId(adId: string): Promise<ParsedData | null> {
        const delay = getRandomDelay();
        await new Promise(resolve => setTimeout(resolve, delay));

        try{
            const baseUrl = `https://krisha.kz/a/show/${adId}`;
            const response = await axios.get(baseUrl, {headers});
            const $ = cheerio.load(response.data);

            const id = parseInt(adId);

            const title = $('.offer__advert-title h1').text().trim();

            const address = $(".offer__advert-title h1").text().split(",")[$(".offer__advert-title h1").text().split(",").length - 1].trim();

            const priceText = $('div.offer__price').text();
            const price = parseInt(priceText.replace(/\D/g, ''));

            const location = $('.offer__advert-short-info span').text().trim();
            
            const floorText = String($('div[data-name="flat.floor"] .offer__advert-short-info').text());
            const floorString = floorText.match(/(\d+)\s+из\s+(\d+)/);
            const floor = parseInt(floorString ? floorString[0]: floorText);
            const floorMax = parseInt(floorString ? floorString[floorString.length - 1]: floorText);
            
            const areaText = $('div[data-name="live.square"] .offer__advert-short-info').text().trim();
            const area = parseFloat(areaText.replace(/\D/g, ""));

            const buildingType = $('[data-name="flat.building"] .offer__advert-short-info').text().trim();
            const yearBuilt = $('[data-name="house.year"] .offer__advert-short-info').length > 0 ? parseInt($('[data-name="house.year"] .offer__advert-short-info').text().trim()) : 0;
            
            const roomsText = $('.offer__advert-title h1').text().trim();
            const rooms = parseInt(roomsText.replace(/(^\d+)(.+$)/i,'$1'));

            const toilet = $('[data-name="flat.toilet"] .offer__advert-short-info').text().trim();
            
            const security = $('div[data-name="flat.security"] .offer__advert-short-info').text().trim();
            const description = $('.a-text-white-spaces').text().trim();

            let pageUrl = '';
            
            const parsedData: ParsedData = {
                id,
                title,
                baseUrl,
                address,
                price,
                location,
                buildingType,
                yearBuilt,
                floor,
                floorMax,
                toilet,
                area,
                rooms,
                security,
                description,
                pageUrl,
            };

            return parsedData;
        }catch(error){
            console.log("parseId function error! ", error)
            return null;
        }
    }

    public static async multiPageParse(city: string, pageNumber: number, neededViews: number): Promise<ParsedData[] | null> {
        const delay = getRandomDelay();
        await new Promise(resolve => setTimeout(resolve, delay));
        
        try{
            let scrapedDataArray: ParsedData[] = [];
            const cityUrl = `https://krisha.kz/arenda/kvartiry/${city}/?rent-period-switch=%2Farenda%2Fkvartiry&page=${pageNumber}`
            const response = await axios.get(cityUrl, {headers});
            const $ = cheerio.load(response.data);
            const elements = $('.a-card');
            const ids: string[] = await this.getAllId($);
            const views = await this.getAdsViewsById(ids);
            let isPayedId;
            for( const id of ids ) {
                if(views[id] <= neededViews) {
                    const scrapedData = await this.parseId(id);
                    if(scrapedData !== null){
                        scrapedData.pageUrl = `https://krisha.kz/arenda/kvartiry/${city}/?rent-period-switch=%2Farenda%2Fkvartiry&page=${pageNumber}`;
                        scrapedDataArray.push(scrapedData);
                    }
                }
            }
            elements.each(( index, element ) => {
                const $ = cheerio.load(element);
                const innerElements = $('div.a-card__paid-services.paid-labels').find('*');
                if (innerElements.length <= 0) {
                    const dataId = $(innerElements).attr("data-id");
                    if(dataId !== undefined){
                        const id = parseInt(dataId);
                        scrapedDataArray = scrapedDataArray.filter((obj) => obj.id !== id);
                    }
                }
            });
            return scrapedDataArray;
        }catch(error){
            console.error("multiPageParse function error! ", error)
            return null;
        }
    }

    public static async getAllId($: any) : Promise<string[]>{
        const allCards = Array.from($(".a-card"));
        let result: string[] = [];
        allCards.forEach((card) => {
            const dataId = $(card).attr("data-id");
            if (typeof dataId === "string") {
                result.push(dataId);
            }
        });

        return result;
    }

    public static async getAdsViewsById (
        adsIds: string[]
      ): Promise<{ [key: string]: number; }> 
    {
        const response = await axios.get(`https://krisha.kz/ms/views/krisha/live/${adsIds.join(",")}/`);
        const data = response.data.data;
        
        const result: {
            [key: string]: number;
        } = {};
    
        for (const id of adsIds) {
            result[id] = data[id].nb_views;
        };
        
        return result;
    };
}