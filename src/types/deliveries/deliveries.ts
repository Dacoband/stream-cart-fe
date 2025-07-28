export interface PreviewDelivery{
    formProvince:string;
    formDistrict:string;
    formWard:string;
    toProvinceId:string;
    toDistrict:string;
    toWard:string;
    listproducts:ProductDelivery[]

}
export interface ProductDelivery{
   name:string;
   quantity:string;
   weight:number;
   length:number;
   width:number;
   height:number;
    

}