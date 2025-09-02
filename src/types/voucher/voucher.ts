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
    shopImageUrl?: string;       
  hoursRemaining?: number;     
  isExpiringSoon?: boolean;
}
export interface VoucherAppliedResult {
  discountAmount: number;      
  finalAmount: number;          
  discountPercentage: number;
  discountMessage: string;
  voucher?: Voucher;
}
export interface VoucherAvailableItem {
  voucher: Pick<
    Voucher,
    | "id"
    | "shopId"
    | "code"
    | "description"
    | "type"
    | "typeDisplayName"
    | "value"
    | "maxValue"
    | "minOrderAmount"
    | "startDate"
    | "endDate"
    | "remainingQuantity"
    | "shopName"
    | "shopImageUrl"
    | "hoursRemaining"
    | "isExpiringSoon"
  >;
  discountAmount: number;
  finalAmount: number;
  discountPercentage: number;
  discountMessage: string;
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
export interface UpdateVoucher{
    description:string;
     value:number;
     maxValue:number;
        minOrderAmount:number;
   startDate:Date;
    endDate:Date;
    availableQuantity:number

}
export interface SearchVoucher{
  orderAmount:number;
  shopId:string;
  sortByDiscountDesc:boolean;

}