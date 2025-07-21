export interface CreateOrderRequest {
  shopId: string;
  shippingProviderId: string;
  paymentMethod: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  customerNotes: string;
  livestreamId: string;
  createdFromCommentId: string;
  shippingFee: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  ward: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  state: string;
  isDefault: boolean;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  notes: string;
}
