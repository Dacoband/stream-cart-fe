import { RegisterShop, FilterShop } from './../../../types/shop/shop'
import rootApi from '../../rootApi'
import type { ShopSearchResult } from '../../../types/shop/shop'

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

export const getshopById = async (shopId: string) => {
  try {
    const response = await rootApi.get(`shops/${shopId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching Shop detail:', error)
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
export const getShopMembers = async (shopId: string) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Not found token.')
    }

    const response = await rootApi.get(
      `accounts/moderators/by-shop/${shopId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    console.log('moderator', response)
    return response.data
  } catch (error) {
    console.error('Error fetching shop members:', error)
    throw new Error('Xảy ra lỗi trong quá trình tải danh sách thành viên')
  }
}
export const approveShop = async (shopId: string) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Không tìm thấy token.')

    const response = await rootApi.post(`shops/${shopId}/approve`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    console.log(response)
    return response.data // ShopDto
  } catch (error) {
    console.error('Error approving shop:', error)
    throw new Error('Xảy ra lỗi trong quá trình duyệt cửa hàng.')
  }
}
export const rejectShop = async (shopId: string, reason: string) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Không tìm thấy token.')

    const response = await rootApi.post(
      `shops/${shopId}/reject`,
      { reason },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    console.log(response)
    return response.data // ShopDto
  } catch (error) {
    console.error('Error rejecting shop:', error)
    throw new Error('Xảy ra lỗi trong quá trình từ chối cửa hàng.')
  }
}

export const searchShops = async (query: string): Promise<ShopSearchResult[]> => {
  if (!query.trim()) return []
  try {
    const response = await rootApi.get('shops/search', { params: { query } })
    return (response.data?.data || response.data) as ShopSearchResult[]
  } catch (error) {
    console.error('Error searching shops:', error)
    throw error
  }
}
