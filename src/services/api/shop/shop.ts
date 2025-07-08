import { RegisterShop, FilterShop, ListShop } from './../../../types/shop/shop'
import rootApi from '../../rootApi'

// Register Shop
export const registerShop = async (data: RegisterShop) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Not found token.')
    }

    const response = await rootApi.post('shops', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data
  } catch (error) {
    console.error('Error registering shop:', error)
    throw error
  }
}

export const getMyShop = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Not found token.')
    }

    const response = await rootApi.get('shops/my-shops', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data?.[0] || null
  } catch (error) {
    console.error('Error fetching Shop:', error)
    throw error
  }
}

export const getAllShops = async (filter: FilterShop) => {
  try {
    const response = await rootApi.get('shops', {
      params: {
        pageNumber: filter.pageNumber,
        pageSize: filter.pageSize,
        status: filter.status,
        approvalStatus: filter.approvalStatus,
        searchTerm: filter.searchTerm,
        sortBy: filter.sortBy,
        ascending: filter.ascending,
      },
    })

    return response.data
  } catch (error) {
    console.error('Error fetching shops:', error)
    throw new Error('Xảy ra lỗi trong quá trình tìm cửa hàng')
  }
}

export const getShopDetail = async (id: string) => {
  try {
    const response = await rootApi.get(`shops/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching shop detail:', error)
    throw new Error('Xảy ra lỗi trong quá trình tải thông tin cửa hàng')
  }
}
