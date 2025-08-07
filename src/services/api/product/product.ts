import rootApi from '../../rootApi'
import { CreateProduct, GetPagedProductsParams } from '@/types/product/product'
export const getAllProducts = async () => {
  try {
    const response = await rootApi.get('products')
    return response.data
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error
  }
}
export const getProductById = async (productId: string) => {
  try {
    const response = await rootApi.get(`products/${productId}`)
    return response.data.data
  } catch (error) {
    console.error('Error fetching product detail:', error)
    throw error
  }
}
export const getProductDetailById = async (productId: string) => {
  try {
    const response = await rootApi.get(`products/${productId}/detail`)
    return response.data.data
  } catch (error) {
    console.error('Error fetching product detail:', error)
    throw error
  }
}

export const createProduct = async (data: CreateProduct) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Not found token.')
    }

    const response = await rootApi.post('products', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    console.error('Error creating product:', error)
    throw error
  }
}
export const getBestSellingProducts = async () => {
  try {
    const response = await rootApi.get('products/bestselling?count=18')
    return response.data.data
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error
  }
}
export const getProductsByShopId = async (
  shopId: string,
  activeOnly: boolean = false
) => {
  try {
    const response = await rootApi.get(`products/shop/${shopId}`, {
      params: {
        activeOnly,
      },
    })
    console.log('shopproduct', response)
    return response.data?.data || []
  } catch (error) {
    console.error('Error fetching products by shop ID:', error)
    throw new Error('Không thể tải danh sách sản phẩm của cửa hàng.')
  }
}
export const getPagedProducts = async (params: GetPagedProductsParams) => {
  try {
    const response = await rootApi.get('products/paged', {
      params,
    })
    console.log('list product', response)
    return response.data?.data.items
  } catch (error) {
    console.error('Error fetching paged products:', error)
    throw new Error('Không thể tải danh sách sản phẩm phân trang.')
  }
}
