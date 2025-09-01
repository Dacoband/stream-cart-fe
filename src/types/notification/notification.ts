// DetailNotificationDTO
export interface DetailNotificationDTO {
  notificationId: string
  recipentUserId: string
  orderCode?: string | null
  productId?: string | null
  variantId?: string | null
  livestreamId?: string | null
  type: string
  message: string
  linkUrl?: string | null
  isRead: boolean
  created?: string | null // dạng ISO string từ backend
}

// ListNotificationDTO
export interface ListNotificationDTO {
  totalItem: number
  pageIndex: number
  pageCount: number
  notificationList: DetailNotificationDTO[]
}
export interface FilterNotificationDTO {
  Type?: string | null
  IsRead?: boolean | null
  PageIndex?: number | null
  PageSize?: number | null
}

export function toQueryString(obj: Record<string, any>) {
  const params = Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
    )
  return params.join('&')
}
