export interface FlashSaleProduct{
    id:string;
    productId:string;
    variantId:string;
    flashSalePrice:number;
    quantityAvailable:number;
    quantitySold:number;
    startTime:string;
    endTime:string;

}
export interface CreateFlashSale{
    productId:string;
    variantId:string[];
    flashSalePrice:number;
    quantityAvailable:number;
    
    startTime:Date;
    endTime:Date;
}