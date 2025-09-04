import rootApi from "@/services/rootApi";

export interface ProductVariant {
  variantId: string;
  attributeValues: Record<string, string>;
  stock: number;
  price: number;
  flashSalePrice: number;
  finalPrice: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  variantImage: string | null;
}

export interface ProductAttribute {
  attributeName: string;
  valueImagePairs: Array<{
    value: string;
    imageUrl: string;
  }>;
}

export interface ProductDetail {
  productId: string;
  productName: string;
  description: string;
  categoryId: string;
  categoryName: string;
  basePrice: number;
  discountPrice: number;
  finalPrice: number;
  stockQuantity: number;
  quantitySold: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  primaryImage: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  modifiedBy: string;
  modifiedAt: string;
  shopId: string;
  shopName: string;
  shopStartTime: string;
  shopCompleteRate: number;
  shopTotalReview: number;
  shopRatingAverage: number;
  shopLogo: string;
  shopTotalProduct: number;
  attributes: ProductAttribute[];
  variants: ProductVariant[];
}

export interface ProductDetailResponse {
  success: boolean;
  message: string;
  data: ProductDetail;
  errors: string[];
}

/**
 * Lấy thông tin chi tiết sản phẩm theo ID
 */
export const getProductDetail = async (productId: string): Promise<ProductDetail> => {
  try {
    const response = await rootApi.get<ProductDetailResponse>(`products/${productId}/detail`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || "Không thể lấy thông tin sản phẩm");
    }

    return response.data.data;
  } catch (error) {
    console.error("Error fetching product detail:", error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error("Có lỗi xảy ra khi lấy thông tin sản phẩm");
  }
};

/**
 * Lấy stock của variant cụ thể từ chi tiết sản phẩm
 */
export const getVariantStock = (productDetail: ProductDetail, variantId?: string): number => {
  if (!variantId) {
    // Nếu không có variant ID, trả về stock tổng của sản phẩm
    return productDetail.stockQuantity;
  }

  const variant = productDetail.variants.find(v => v.variantId === variantId);
  return variant?.stock || 0;
};

/**
 * Kiểm tra stock có đủ không
 */
export const checkStockAvailability = (
  productDetail: ProductDetail, 
  requestedStock: number, 
  variantId?: string
): { isValid: boolean; maxStock: number; message?: string } => {
  const maxStock = getVariantStock(productDetail, variantId);
  
  if (requestedStock > maxStock) {
    return {
      isValid: false,
      maxStock,
      message: variantId 
        ? `Số lượng tối đa cho phân loại này là ${maxStock}`
        : `Số lượng tối đa trong kho là ${maxStock}`
    };
  }

  return {
    isValid: true,
    maxStock
  };
};
