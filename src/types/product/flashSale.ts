
export interface FlashSaleOverView{
  date:Date;
  slot:number;
  status:string;
  totalProduct:number;
}
export interface FlashSaleProductHome{
    id:string;
    productId:string;
    variantId:string;
    flashSalePrice:number;
    quantityAvailable:number;
    quantitySold:number;
    isActive:boolean;
    startTime:string;
    endTime:string;
    slot:number;
    productName:string;
    productImageUrl:string;
    variantName:string;
    price:number,
    stock:number;

}
export interface FlashSaleVariantMap {
  [variantId: string]: {
    price: number;
    quantity: number;
  };
}

export interface FlashSaleProduct {
  productId: string;
  variantMap: FlashSaleVariantMap;
  flashSalePrice: number;
  quantityAvailable: number;
}

export interface CreateFlashSale {
  products: FlashSaleProduct[];
  slot: number;
  date: string; 
}
export interface UpdateFlashSale {
  flashSalePrice: number;
  quantityAvailable:number;
   startTime:string;
    endTime:string;
}

export interface filterFlashSale {
  // pageIndex?: number
  // pageSize?: number
  StartDate?: Date
  Slot?: number
  // isActive?: boolean

}

export interface SlotTime {
  start: string;
  end: string;
}


export const SLOT_TIMES: Record<number, SlotTime> = {
  1: { start: "00:00:00", end: "02:00:00" },
  2: { start: "02:00:00", end: "06:00:00" },
  3: { start: "06:00:00", end: "09:00:00" },
  4: { start: "09:00:00", end: "14:00:00" },
  5: { start: "14:00:00", end: "17:00:00" },
  6: { start: "17:00:00", end: "19:00:00" },
  7: { start: "19:00:00", end: "21:00:00" },
  8: { start: "21:00:00", end: "23:59:59" },
};
export interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  stock: number;
  variantName: string;
}

export interface ProductWithoutFlashSale {
  id: string;
  productName: string;
  description: string;
  sku: string;
  basePrice: number;
  stockQuantity: number;
  productImageUrl: string;
  variants: ProductVariant[] | null; 
}
export interface DeleteFlashSale{
date:Date;
slot:number;

}