export interface ProductLiveStream{
    id: string;
   livestreamId:string;
   productId:string;
   variantId:string;
   isPinned:boolean;
   price:number;
   stock:number;
   createAt:Date;
   lastModifiedAt:Date;
   productName:string;
   productImageUrl:string;
   variantName:string;
   variantImageUrl:string;

}