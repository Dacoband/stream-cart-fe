export interface Address{
    id:string;
    recipientName:string;
    street:string;
    ward:string;
    district:string;
    city:string;
    country:string;
    postalCode:string;
    phoneNumber:string;
    isDefaultShipping:boolean;
    latitude:number;
    longitude:number;
    type:number;
    isActive:boolean;
    accountId:string;
    shopId:string;
    createdAt:Date;
    createdBy:string;
    lastModifiedAt:Date;
   lastModifiedBy:string;
}
export interface CreateAddress{
       recipientName:string;
    street:string;
    ward:string;
    district:string;
    city:string;
    country:string;
    postalCode:string;
    phoneNumber:string;
    isDefaultShipping:boolean;
    latitude:number;
    longitude:number;
    type:number;
    shopId:string;

}

export interface Province {
  id: string;
 full_name: string;
 name:string;
}
export interface Ward {
  id: string;
 full_name: string;
  latitude:string;
 longitude:string;
}
