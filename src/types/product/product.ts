export interface Product{
   id:string;
   productName:string;
   description:string;
   sku:string;
   categoryId:string;
   basePrice:number;
   discountPrice:number;
   stockQuantity:number;
   isActive:boolean;
   weight:number;
   dimensions:string;
   hasVariant:boolean;
   quantitySold:number;
   shopId:string;
   createdAt:Date;
   createdBy:string;
   lastModifiedAt:Date;
   lastModifiedBy:string;
}
export interface CreateProduct{
   productName:string;
   description:string;
   sku:string;
   categoryId:string;
   basePrice:number;
   discountPrice:number;
   stockQuantity:number;
   weight:number;
   dimensions:string;
   hasVariant:boolean;
   shopId:string;
}


export interface UpdateProduct{
   id:string;
   productName:string;
   description:string;
   sku:string;
   categoryId:string;
   basePrice:number;
   discountPrice:number;
   weight:number;
   dimensions:string;
   hasVariant:boolean;
}

