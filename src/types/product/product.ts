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
  sortOption: number
  activeOnly: boolean
  shopId: string
  categoryId: string
  inStockOnly: boolean
}
