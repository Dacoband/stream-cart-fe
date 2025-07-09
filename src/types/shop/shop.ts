export interface Shop {
    id:string;
    shopName:string;
    description:string;
    logoURL:string;
    coverImageURL:string;
    ratingAverage:number;
    totalAverage:number;
    registrationDate:Date;
    approvalStatus:string;
    approvalDate:Date;
    bankAccountNumber:string;
    bankName:string;
    taxNumber:string;
    totalProduct:number;
    completeRate:number;
    status:boolean;
   accountId:string;
   createdBy:string
    createdAt:Date;
    lastModifiedAt:Date;
    lastModifiedBy:string;
    
}
export interface RegisterShop{
    shopName:string;
    description:string;
    logoURL:string;
    coverImageURL:string;

}