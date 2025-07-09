export interface ProductImage{
    id:string;
    productId:string;
    variantId:string;
    imageUrl:string;
    isPrimary:boolean;
    displayOrder:number;
    altText:string;
    createdAt:Date;
    createdBy:string;
    lastModifiesAt:Date;
    lastModifiedBy:string;
}