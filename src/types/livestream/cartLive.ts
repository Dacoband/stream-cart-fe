export interface PreviewOrderLive {
    livestreamId:string;
  totalItem: number;
  subTotal: number;
  discount: number;
  totalAmount: number;
  listCartItem: CartItemByShop[]; 
}
export interface CartItemByShop {
  shopId: string;
  shopName: string;
  products: CartProduct[];
}
export interface CartProduct {
  cartItemId: string;
  productId: string;
  variantID: string;
  productName: string;
  priceData: PriceData;
  quantity: number;
  primaryImage: string;
  attributes: Record<string, string>;
  stockQuantity: number;
  productStatus: boolean;
  length:number;
  width:number;
  height:number;
  weight:number;
}
export interface PriceData {
  currentPrice: number;
  originalPrice: number;
  discount: number;
}
