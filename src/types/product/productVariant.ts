// Product Variant
export interface ProductVariant{
   id:string;
   productId:string;
   sku:string;
   price:number;
   flashSalePrice:number;
   stock:number;
   createdAt:Date;
   createBy:string;
   lastModifiedAt:Date;
   lastModifiedBy:string;

}
export interface CreateProductVariant{
   productId:string;
   sku:string;
   price:number;
   flashSalePrice:number;
   stock:number;
}