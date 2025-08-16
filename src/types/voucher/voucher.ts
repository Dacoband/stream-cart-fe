export interface Voucher{
    id:string;
    shopId:string;
    code:string;
    description:string;
    type:number;
    typeDisplayName:string;
    value:number;
    maxValue:number;
    minOrderAmount:number;
    startDate:Date;
    endDate:Date;
    availableQuantity:number;
    usedQuantity:number;
    remainingQuantity:number;
    isActive:boolean;
    isValid:boolean;
    isExpired:boolean;
    createAt:Date;
    createBy:string;
    lastModifiedAt:Date;
    lastModifiedBy:string;
    shopName:string;
}
export interface CreateVoucher{
    code:string;
    description:string;
    type:number;
    value:number;
    maxValue:number;
    minOrderAmount:number;
    startDate:Date;
    endDate:Date;
    availableQuantity:number

}