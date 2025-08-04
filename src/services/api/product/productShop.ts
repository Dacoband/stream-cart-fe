import rootApi from '../../rootApi'

export interface ProductByShop {
  id: string
  productName: string
  description: string
  sku?: string // Optional vì search API không có field này
  categoryId: string
  categoryName?: string // Search API có thêm field này
  basePrice: number
  discountPrice: number
  finalPrice: number
  stockQuantity: number
  isActive?: boolean // API gốc
  inStock?: boolean // Search API
  weight?: number
  length?: number
  width?: number
  height?: number
  hasVariant?: boolean
  quantitySold: number
  shopId: string
  shopName?: string // Search API có thêm
  shopLocation?: string // Search API có thêm
  shopRating?: number // Search API có thêm
  createdAt?: string
  createdBy?: string
  lastModifiedAt?: string
  lastModifiedBy?: string
  hasPrimaryImage?: boolean
  primaryImageUrl: string | null
  // Search API specific fields
  discountPercentage?: number
  isOnSale?: boolean
  averageRating?: number
  reviewCount?: number
  highlightedName?: string
}

export interface SearchApiResponse {
  currentPage: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
  items: ProductByShop[]
}

export interface ProductsResponse {
  success: boolean
  message: string
  data: ProductByShop[] | { 
    products?: SearchApiResponse
    items?: ProductByShop[]
    totalResults?: number
    searchTerm?: string
    searchTimeMs?: number
    suggestedKeywords?: string[]
    appliedFilters?: {
      categoryId?: string | null
      minPrice?: number | null
      maxPrice?: number | null
      shopId?: string
      sortBy?: string
      inStockOnly?: boolean
      minRating?: number | null
      onSaleOnly?: boolean
    }
  }
  errors: string[]
}

export interface ProductFilter {
  shopId: string
  pageNumber: number
  pageSize: number
  searchTerm?: string
  sortBy?: 'productName' | 'basePrice' | 'finalPrice' | 'quantitySold' | 'createdAt'
  ascending?: boolean
  minPrice?: number
  maxPrice?: number
  activeOnly?: boolean
  categoryId?: string
  inStockOnly?: boolean
  minRating?: number
  onSaleOnly?: boolean
}

export const getProductsByShop = async (filter: ProductFilter): Promise<ProductsResponse> => {
  try {
    // Nếu có searchTerm, sử dụng endpoint search riêng
    const endpoint = filter.searchTerm 
      ? `products/shop/${filter.shopId}/search`
      : `products/shop/${filter.shopId}`
    
    // Parameters cho search API khác với API gốc
    const params = filter.searchTerm ? {
      // Search API parameters
      SearchTerm: filter.searchTerm,
      PageNumber: filter.pageNumber,
      PageSize: filter.pageSize,
      CategoryId: filter.categoryId,
      MinPrice: filter.minPrice,
      MaxPrice: filter.maxPrice,
      SortBy: filter.sortBy,
      InStockOnly: filter.inStockOnly,
      MinRating: filter.minRating,
      OnSaleOnly: filter.onSaleOnly,
    } : {
      // Original API parameters
      pageNumber: filter.pageNumber,
      pageSize: filter.pageSize,
      sortBy: filter.sortBy,
      ascending: filter.ascending,
      minPrice: filter.minPrice,
      maxPrice: filter.maxPrice,
      activeOnly: filter.activeOnly,
    }
    
    const response = await rootApi.get(endpoint, { params })
    
    // Kiểm tra response structure
    if (response.data && response.data.success) {
      return response.data
    } else {
      throw new Error(response.data?.message || 'API response không hợp lệ')
    }
  } catch (error) {
    console.error('Error fetching products by shop:', error)
    throw new Error('Không thể tải danh sách sản phẩm')
  }
}
