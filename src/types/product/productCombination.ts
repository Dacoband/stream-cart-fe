export interface ProductCombination{
variantId:string;
attributeValueIs:string;
attributeName:string;
valueName:string;
createdAt:Date;
createdBy:string;
  lastModifiedAt:Date;
   lastModifiedBy:string;
}
export interface CreateProductCombination{
    variantId:string;
    attributeValueId:string;
}