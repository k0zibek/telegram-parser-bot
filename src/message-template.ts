import { SaveParsedDataType } from "./data/article";

export const adMessageTemplate = (data: SaveParsedDataType) => {
  return `
${data.id} (id)
${data.rooms}-комнатная квартира, ${data.area} м², ${data.address}
Стоимость: ${data.price.toLocaleString("ru")} 〒
Город: ${data.location}
${data.buildingType !== "" ? "Тип Дома: " + data.buildingType + "\n" : ""}${data.yearBuilt !== 0 ? "Год постройки: " + data.yearBuilt + "\n" : ""} Этаж: ${data.floor !== 0 && data.floorMax !== 0 ? data.floor + " из " + data.floorMax : "не указан"}
Площадь: ${data.area} м²
Охранная система: ${data.security !== '' ? data.security : 'отсутствует'}
Общее описание: ${data.description !== '' ? '\n'+data.description : 'отсутствует'}
${data.toilet !== "" ? "Санузел: " + data.toilet : ""}
${data.baseUrl}
`;
};