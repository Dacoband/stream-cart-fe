import axios from 'axios'
import rootApi from '@/services/rootApi'
import {
  FilterNotificationDTO,
  toQueryString,
} from '@/types/notification/notification'

export async function fetchMyNotifications(filter: FilterNotificationDTO) {
  const qs = toQueryString(filter as Record<string, string | number | boolean>)
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
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const data = err.response?.data
      const message =
        (data && (data.message ?? JSON.stringify(data))) ??
        err.response?.statusText ??
        err.message
      throw new Error(message || 'Unknown error')
    }
    if (err instanceof Error) throw err
    throw new Error('Unknown error')
  }
}

export async function markNotificationAsRead(id: string) {
  if (!id) throw new Error('Invalid notification id')

  const token = localStorage.getItem('token')
  if (!token) throw new Error('Not found token.')

  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  }

  try {
    const res = await rootApi.patch(`/notification/mark-as-read/${id}`, null, {
      headers,
    })
    return res.data
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const data = err.response?.data
      const message =
        (data && (data.message ?? JSON.stringify(data))) ??
        err.response?.statusText ??
        err.message
      throw new Error(message || 'Unknown error')
    }
    if (err instanceof Error) throw err
    throw new Error('Unknown error')
  }
}
