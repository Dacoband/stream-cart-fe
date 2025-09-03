import rootApi from '../../rootApi'
import { FilterShopMembership } from '@/types/membership/shopMembership'

export const purchaseShopMembership = async (membershipId: string) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Not found token.')
    }

    const response = await rootApi.post('/shopmembership', membershipId, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error purchasing shop membership:', error)
    throw error
  }
}

export const filterShopMembership = async (filter: FilterShopMembership) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Not found token.')
    }

    const response = await rootApi.get('/shopmembership/filter', {
      params: filter,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    console.log(response.data.data)
    return response.data.data
  } catch (error) {
    console.error('Error filtering shop memberships:', error)
    throw error
  }
}

export const deactivateShopMembership = async (id: string) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Not found token.')
    }

    const response = await rootApi.delete(`/shopmembership/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data
  } catch (error) {
    console.error('Error deactivating shop membership:', error)
    throw error
  }
}
