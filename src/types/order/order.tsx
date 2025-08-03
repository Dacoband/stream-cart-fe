export interface CreateOrder {
  paymentMethod: string;
  addressId: string;
  livestreamId: string | null;
  createdFromCommentId: string | null;
  ordersByShop: ShopOrderCreate[];
}

export interface ShopOrderCreate {
  shopId: string;
  shippingProviderId: string;
  shippingFee: number | null;
  expectedDeliveryDay: string;
  voucherCode: string;
  items: OrderItemCreate[];
  customerNotes: string | null;
}

export interface OrderItemCreate {
  productId: string;
  variantId: string;
  quantity: number;
  // unitPrice: number;
}

export type OrderItemResponse = {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  totalPrice: number;
  notes: string;
  refundRequestId: string | null;
  productName: string;
  productImageUrl: string;
};

export type ShippingAddress = {
  fullName: string;
  phone: string;
  addressLine1: string;
  ward: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  state: string;
  isDefault: boolean;
};

export type Order = {
  id: string;
  orderCode: string;
  orderDate: Date;
  orderStatus: number;
  paymentStatus: number;
  totalPrice: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;
  customerNotes: string;
  estimatedDeliveryDate: string;
  actualDeliveryDate: string | null;
  trackingCode: string;
  shippingAddress: ShippingAddress;
  accountId: string;
  shopId: string;
  shippingProviderId: string;
  livestreamId: string | null;
  items: OrderItemResponse[];
};
