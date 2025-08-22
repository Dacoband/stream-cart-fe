export interface ProductLiveStream{
    id: string;
   livestreamId:string;
   productId:string;
   variantId:string;
   isPin:boolean;
   originalPrice:number;
   price:number;
   stock:number;
   createAt:Date;
   lastModifiedAt:Date;
   productName:string;
   productImageUrl:string;
   variantName:string;
   variantImageUrl:string;
   sku:string;
   productStock:number

}