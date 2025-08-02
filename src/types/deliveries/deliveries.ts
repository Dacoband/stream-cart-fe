export interface ShippingItem {
  name: string;
  quantity: number;
  weight: number;
  length: number;
  width: number;
  height: number;
}

export interface FromShop {
  fromShopId: string;
  items: ShippingItem[];
}

export interface PreviewDeliveries  {
  fromShops: FromShop[];
  toProvince: string;
  toDistrict: string;
  toWard: string;
}
export interface ServiceResponse {
  shopId: string;
  serviceTypeId: number;
  serviceName: string;
  totalAmount: number;
  expectedDeliveryDate: string;
}

export interface PreviewDeliveriesResponse {


    serviceResponses: ServiceResponse[];
    totalAmount: number;


}
