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
  pageNumber: number
  pageSize: number
  sortOption?: number // Theo ảnh: integer($int32)  
  activeOnly?: boolean
  categoryId?: string
  inStockOnly?: boolean
  searchTerm?: string // Cho tìm kiếm
  // shopId sẽ được truyền riêng vào function parameter
}

export const getProductsByShop = async (shopId: string, filter: ProductFilter): Promise<ProductsResponse> => {
  try {
    // API cho sản phẩm của shop cụ thể: https://brightpa.me/api/products/paged với shopId param
    const response = await rootApi.get('products/paged', {
      params: {
        pageNumber: filter.pageNumber,
        pageSize: filter.pageSize,
        sortOption: filter.sortOption,
        activeOnly: filter.activeOnly,
        shopId: shopId, // Truyền shopId vào query params
        categoryId: filter.categoryId,
        InStockOnly: filter.inStockOnly, // Chú ý viết hoa chữ I
      },
    })
    
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
