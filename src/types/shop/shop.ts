export interface Shop {
    id:string;
    shopname:string;
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
    status:true
   accountId:string;
  createdBy:string
    createdAt:string;
    lastModifiedAt:string;
    lastModifiedBy:string;

}
export interface RegisterShop{
    shopName:string;
    description:string;
    logoURL:string;
    coverImageURL:string;

}