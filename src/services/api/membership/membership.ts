import rootApi from '../../rootApi'
import {
  CreateMembership,
  FilterMembershipDTO,
} from '@/types/membership/membership'

export const createMembership = async (data: CreateMembership) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Not found token.')
    }

    const response = await rootApi.post('membership', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data
  } catch (error) {
    console.error('Error create membership:', error)
    throw error
  }
}

export const UpdateMembership = async (id: string, data: CreateMembership) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Not found token.')
    }

    const response = await rootApi.put(`membership/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data
  } catch (error) {
    console.error('Error update membership:', error)
    throw error
  }
}
export const DeleteMembership = async (id: string) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Not found token.')
    }

    const response = await rootApi.delete(
      `membership/${id}`,

      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    return response.data
  } catch (error) {
    console.error('Error delete membership:', error)
    throw error
  }
}
export const getMembership = async (params?: {
  IsDeleted?: boolean
  PageIndex?: number
  PageSize?: number
  SortDirection?: number
}) => {
  try {
    const response = await rootApi.get(`/membership`, { params })
    return response.data.data
  } catch (error) {
    console.error('Error fetching memberships:', error)
    throw error
  }
}

export const filterMembership = async (filter: FilterMembershipDTO) => {
  try {
    const response = await rootApi.get(`/membership`, { params: filter })
    return response.data.data
  } catch (error) {
    console.error('Error filtering memberships:', error)
    throw error
  }
}
