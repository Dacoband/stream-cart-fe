export interface CreateOrder {
  paymentMethod: string;
  addressId: string;
  livestreamId: string | null;
  createdFromCommentId: string | null;
  ordersByShop: ShopOrder[];
}

export interface ShopOrder {
  shopId: string;
  shippingProviderId: string;
  shippingFee: number;
  expectedDeliveryDay: Date;
  voucherCode: string;
  items: OrderItem[];
  customerNotes: string | null;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
}
