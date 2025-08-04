import rootApi from '../../rootApi'

export interface ProductByShop {
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
  createdAt: string
  createdBy: string
  lastModifiedAt: string
  lastModifiedBy: string
  hasPrimaryImage: boolean
  primaryImageUrl: string
}

export interface ProductsResponse {
  success: boolean
  message: string
  data: ProductByShop[]
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
}

export const getProductsByShop = async (filter: ProductFilter): Promise<ProductsResponse> => {
  try {
    const response = await rootApi.get(`products/shop/${filter.shopId}`, {
      params: {
        pageNumber: filter.pageNumber,
        pageSize: filter.pageSize,
        searchTerm: filter.searchTerm,
        sortBy: filter.sortBy,
        ascending: filter.ascending,
        minPrice: filter.minPrice,
        maxPrice: filter.maxPrice,
        activeOnly: filter.activeOnly,
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
