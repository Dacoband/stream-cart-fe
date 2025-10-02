// services/api/order/order.ts
import rootApi from '../../rootApi'

type Period = 'daily' | 'weekly' | 'monthly'

const authHeader = () => {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Not found token.')
  return { Authorization: `Bearer ${token}` }
}

const toIso = (d?: string | Date | null) =>
  d ? (typeof d === 'string' ? d : d.toISOString()) : undefined

/**
 * GET /api/orders/system/statistics
 * Query: ?fromDate&toDate
 */
export const getSystemOrderStatistics = async (opts?: {
  fromDate?: string | Date | null
  toDate?: string | Date | null
}) => {
  try {
    const response = await rootApi.get('orders/system/statistics', {
      params: {
        fromDate: toIso(opts?.fromDate),
        toDate: toIso(opts?.toDate),
      },
      headers: authHeader(),
    })
    return response.data?.data ?? response.data
  } catch (error) {
    console.error('Error fetching system statistics:', error)
    throw error
  }
}

/**
 * GET /api/orders/system/top-products
 * Query: ?fromDate&toDate&limit
 */
export const getSystemTopProducts = async (opts?: {
  fromDate?: string | Date | null
  toDate?: string | Date | null
  limit?: number
}) => {
  try {
    const response = await rootApi.get('orders/system/top-products', {
      params: {
        fromDate: toIso(opts?.fromDate),
        toDate: toIso(opts?.toDate),
        limit: opts?.limit ?? 10,
      },
      headers: authHeader(),
    })
    return response.data?.data ?? response.data
  } catch (error) {
    console.error('Error fetching system top products:', error)
    throw error
  }
}

/**
 * GET /api/orders/system/time-series
 * Query: ?fromDate&toDate&period=(daily|weekly|monthly)
 */
export const getSystemOrderTimeSeries = async (opts: {
  fromDate: string | Date
  toDate: string | Date
  period?: Period
}) => {
  try {
    const response = await rootApi.get('orders/system/time-series', {
      params: {
        fromDate: toIso(opts.fromDate),
        toDate: toIso(opts.toDate),
        period: opts.period ?? 'daily',
      },
      headers: authHeader(),
    })
    return response.data?.data ?? response.data
  } catch (error) {
    console.error('Error fetching system time series:', error)
    throw error
  }
}
