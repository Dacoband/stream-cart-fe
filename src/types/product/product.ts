export interface Product {
  id: string
  productName: string
  description: string
  sku: string
  categoryId: string
  basePrice: number
  discountPrice: number
  finalPrice: number
  stockQuantity: number
  isActive: boolean
  weight: number
  length: number
  width: number
  height: number
  hasVariant: boolean
  quantitySold: number
  shopId: string
  createdAt: Date
  createdBy: string
  lastModifiedAt: Date
  lastModifiedBy: string
  hasPrimaryImage: boolean
  primaryImageUrl: string
  reserveStock: number

}
export interface ProductDetail {
  productId: string
  productName: string
  description: string
  categoryId: string
  categoryName: string
  basePrice: number
  discountPrice: number
  finalPrice: number
  stockQuantity: number
  quantitySold: number
  // Average rating for this product (0-5). Optional in case backend omits it.
  averageRating?: number
  weight: number
  length: number
  width: number
  height: number
  primaryImage: string[]
  shopId: string
  shopName: string
  shopStartTime: string
  shopCompleteRate: number
  shopTotalReview: number
  shopRatingAverage: number
  shopLogo: string
  shopTotalProduct: number
  attributes: Attribute[]
  variants: Variant[]
}

export interface Attribute {
  attributeName: string
  valueImagePairs: ValueImagePair[]
}

export interface ValueImagePair {
  value: string
  imageUrl: string
}

export interface Variant {
  variantId: string | null
  attributeValues: Record<string, string>
  stock: number
  price: number
  weight: number
  length: number
  width: number
  height: number
  flashSalePrice: number
  variantImage: VariantImage
}

export interface VariantImage {
  imageId: string
  url: string
  altText: string
}

// export interface CreateProduct{
//    productName:string;
//    description:string;
//    sku:string;
//    categoryId:string;
//    basePrice:number;
//    discountPrice:number;
//    stockQuantity:number;
//    weight:number;
//    dimensions:string;
//    hasVariant:boolean;
//    shopId:string;
// }

export interface UpdateProduct {
  id: string
  productName: string
  description: string
  sku: string
  categoryId: string
  basePrice: number
  discountPrice: number
  weight: number
  dimensions: string
  hasVariant: boolean
}

// Create Procuct
export interface ProductImage {
  imageUrl: string
  isPrimary: boolean
  displayOrder: number
  altText: string
}

export interface ProductAttribute {
  name: string
  values: string[]
}

export interface VariantAttribute {
  attributeName: string
  attributeValue: string
}

export interface ProductVariant {
  sku: string
  price: number | null
  stock: number | null
  attributes: VariantAttribute[]
  weight: number | null
  length: number | null
  width: number | null
  height: number | null
}

export interface CreateProductDTO {
  productName: string
  description: string
  sku: string
  categoryId: string
  basePrice: number
  stockQuantity: number
  weight: number
  length: number
  width: number
  height: number
  hasVariant: boolean
  shopId: string
  images: ProductImage[]
  attributes: ProductAttribute[]
  variants: ProductVariant[]
}

export interface filterProduct {
  pageNumber?: number
  pageSize?: number
  sortOption?: number
  activeOnly?: boolean
  shopId?: string
  InstockOnly?: boolean
}
export interface GetPagedProductsParams {
  pageNumber: number
  pageSize: number
  sortOption: number | null
  activeOnly: boolean
  shopId: string
  categoryId: string | null
  inStockOnly: boolean | null
}
export interface ProductSearchParams {
  searchTerm: string
  pageNumber?: number
  pageSize?: number
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  shopId?: string
  sortBy?: string
  inStockOnly?: boolean
  minRating?: number
  onSaleOnly?: boolean
}
export interface SearchProduct extends Product {
  categoryName?: string
  shopName?: string
  shopLocation?: string
  shopRating?: number
  discountPercentage?: number
  isOnSale?: boolean
  averageRating?: number
  reviewCount?: number
  highlightedName?: string
}

export interface SearchProductsPage {
  currentPage: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
  items: SearchProduct[]
}

export interface ProductSearchResponse {
  success: boolean
  message: string
  data: {
    products: SearchProductsPage
    totalResults: number
    searchTerm: string
    searchTimeMs: number
    suggestedKeywords: string[]
    appliedFilters: {
      categoryId: string | null
      minPrice: number | null
      maxPrice: number | null
      shopId: string | null
      sortBy: string | null
      inStockOnly: boolean
      minRating: number | null
      onSaleOnly: boolean | null
    }
  }
  errors: string[]
}
