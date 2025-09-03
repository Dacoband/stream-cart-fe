import rootApi from '@/services/rootApi'
import {
  ConfirmRefundDto,
  CreateRefundRequestDto,
  RefundRequestDto,
  RefundStatus,
  UpdateRefundStatusDto,
} from '@/types/refund/refund'

const authHeader = () => {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Not found token.')
  return { Authorization: `Bearer ${token}` }
}

/* =========================
   APIs
========================= */

/**
 * POST /api/refunds
 * Tạo yêu cầu hoàn tiền
 */
export const createRefundRequest = async (data: CreateRefundRequestDto) => {
  try {
    const res = await rootApi.post('refunds', data, {
      headers: authHeader(),
    })
    // Backend trả ApiResponse<RefundRequestDto>
    return res.data // hoặc res.data.data tuỳ bạn chuẩn hóa ApiResponse
  } catch (error) {
    console.error('Error create refund request:', error)
    throw error
  }
}

/**
 * PUT /api/refunds/status
 * Cập nhật trạng thái hoàn tiền (theo DTO)
 */
export const updateRefundStatus = async (data: UpdateRefundStatusDto) => {
  try {
    const res = await rootApi.put('refunds/status', data, {
      headers: authHeader(),
    })
    return res.data
  } catch (error) {
    console.error('Error update refund status:', error)
    throw error
  }
}

/**
 * GET /api/refunds/{id}
 * Lấy chi tiết 1 yêu cầu hoàn tiền
 */
export const getRefundById = async (id: string) => {
  try {
    const res = await rootApi.get(`refunds/${id}`, {
      headers: authHeader(), // nếu endpoint public thì có thể bỏ
    })
    // theo pattern GET thường dùng res.data.data
    return res.data?.data as RefundRequestDto
  } catch (error) {
    console.error('Error get refund by id:', error)
    throw error
  }
}

/**
 * GET /api/refunds/shop
 * Lấy danh sách refund theo shop (có phân trang + filter)
 */
export const getShopRefunds = async (params?: {
  pageNumber?: number
  pageSize?: number
  status?: RefundStatus
  fromDate?: string | Date
  toDate?: string | Date
}) => {
  try {
    // Chuẩn hoá date -> ISO string nếu truyền Date
    const finalParams = {
      ...params,
      fromDate:
        params?.fromDate instanceof Date
          ? params.fromDate.toISOString()
          : params?.fromDate,
      toDate:
        params?.toDate instanceof Date
          ? params.toDate.toISOString()
          : params?.toDate,
    }

    const res = await rootApi.get('refunds/shop', {
      params: finalParams,
      headers: authHeader(),
    })
    // Controller trả ApiResponse<PagedResult<RefundRequestDto>>
    return res.data?.data
  } catch (error) {
    console.error('Error fetching shop refunds:', error)
    throw error
  }
}

/**
 * PUT /api/refunds/{id}/confirm
 * Seller/OperationManager xác nhận hoặc từ chối hoàn tiền
 */
export const confirmRefund = async (id: string, data: ConfirmRefundDto) => {
  try {
    const res = await rootApi.put(`refunds/${id}/confirm`, data, {
      headers: authHeader(),
    })
    return res.data
  } catch (error) {
    console.error('Error confirm refund:', error)
    throw error
  }
}
