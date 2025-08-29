import rootApi from '@/services/rootApi'
import {
  FilterNotificationDTO,
  toQueryString,
} from '@/types/notification/notification'

export async function fetchMyNotifications(filter: FilterNotificationDTO) {
  const qs = toQueryString(filter as Record<string, any>)
  const url = `/notification${qs ? `?${qs}` : ''}`

  const token = localStorage.getItem('token')
  if (!token) throw new Error('Not found token.')

  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  }

  try {
    const res = await rootApi.get(url, { headers })
    return res.data
  } catch (err: any) {
    if (err?.response) {
      const data = err.response.data
      const message =
        data?.message || JSON.stringify(data) || err.response.statusText
      throw new Error(message)
    }
    throw new Error(err?.message || 'Unknown error')
  }
}

// Thêm hàm gọi PATCH /notification/mark-as-read/{id}
export async function markNotificationAsRead(id: string) {
  if (!id) throw new Error('Invalid notification id')

  const token = localStorage.getItem('token')
  if (!token) throw new Error('Not found token.')

  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  }

  try {
    // body null because endpoint reads id from route
    const res = await rootApi.patch(`/notification/mark-as-read/${id}`, null, {
      headers,
    })
    return res.data
  } catch (err: any) {
    if (err?.response) {
      const data = err.response.data
      const message =
        data?.message || JSON.stringify(data) || err.response.statusText
      throw new Error(message)
    }
    throw new Error(err?.message || 'Unknown error')
  }
}
