export interface FlashSaleProductHome{
    id:string;
    productId:string;
    variantId:string;
    flashSalePrice:number;
    quantityAvailable:number;
    quantitySold:number;
    startTime:string;
    endTime:string;
    slot:number;
    productName:string;
    productImageUrl:string;
    variantName:string;

}
export interface FlashSaleProduct {
  productId: string;
  variantIds: string[];
  flashSalePrice: number;
  quantityAvailable: number;
}

export interface CreateFlashSale {
  products: FlashSaleProduct[];
  slot: number;
  startTime: string; 
  endTime: string;   
}

