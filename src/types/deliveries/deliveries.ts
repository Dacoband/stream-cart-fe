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
