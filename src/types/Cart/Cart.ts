

export interface Cart {
  cartId: string;
  customerId: string;
  totalProduct: number;
  cartItemByShop: CartItemByShop[];
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
}

export interface PriceData {
  currentPrice: number;
  originalPrice: number;
  discount: number;
}

// Create Cart
export interface CreateCart{
    productId:string;
     variantId: string | null;    
     quantity:number;
}
// UpdateCart
export interface UpdateCart{
    cartItem:string;
    variantId:string;
    quantity:number;
}
//Preview
export interface PreviewOrder {
    totalItem:number,
    subTotal:number,
    discount:number;
    totalAmount:number;
}
