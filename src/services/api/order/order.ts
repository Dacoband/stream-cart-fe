import rootApi from '../../rootApi'
import { CreateOrder, OrderSearchParams } from '@/types/order/order'

export const createOrder = async (data: CreateOrder) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Not found token.')
    }

    const response = await rootApi.post('orders/multi', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data
  } catch (error) {
    console.error('Error create orders:', error)
    throw error
  }
}

export const getOrderById = async (id: string) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Not found token.')
    }

    const response = await rootApi.get(`orders/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data
  } catch (error) {
    console.error('Error fetching order by ID:', error)
    throw error
  }
}

export const updateOrderStatus = async (id: string, status: number) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Not found token.')
    }

    const response = await rootApi.put(
      `orders/${id}/status`,
      { status }, // body
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    return response.data
  } catch (error) {
    console.error('Error updating order status:', error)
    throw error
  }
}

export const getOrdersByShop = async (
  shopId: string,
  params?: { PageIndex?: number; PageSize?: number; Status?: number }
) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Not found token.')
    }

    const query = new URLSearchParams()
    if (params?.PageIndex) query.set('PageIndex', String(params.PageIndex))
    if (params?.PageSize) query.set('PageSize', String(params.PageSize))
    if (params?.Status !== undefined) query.set('Status', String(params.Status))

    const url = `orders/shop/${shopId}${
      query.toString() ? `?${query.toString()}` : ''
    }`
    const response = await rootApi.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data
  } catch (error) {
    console.error('Error fetching orders by shop:', error)
    throw error
  }
}

export const getOrdersStatisticsByShop = async (shopId: string) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Not found token.')
    }

    const response = await rootApi.get(`orders/shop/${shopId}/statistics`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data.data
  } catch (error) {
    console.error('Error fetching orders statistics by shop:', error)
    throw error
  }
}

export const getOrders = async (params?: OrderSearchParams) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Not found token.')
    }

    const query = new URLSearchParams()
    if (params?.accountId) query.set('AccountId', params.accountId)
    if (params?.shopId) query.set('ShopId', params.shopId)
    if (params?.orderStatus !== undefined)
      query.set('OrderStatus', String(params.orderStatus))
    if (params?.paymentStatus !== undefined)
      query.set('PaymentStatus', String(params.paymentStatus))
    if (params?.startDate) query.set('StartDate', params.startDate)
    if (params?.endDate) query.set('EndDate', params.endDate)
    if (params?.searchTerm) query.set('SearchTerm', params.searchTerm)
    if (params?.pageNumber) query.set('PageNumber', String(params.pageNumber))
    if (params?.pageSize) query.set('PageSize', String(params.pageSize))

    const url = `orders/search${query.toString() ? `?${query.toString()}` : ''}`
    const response = await rootApi.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data
  } catch (error) {
    console.error('Error fetching orders:', error)
    throw error
  }
}
