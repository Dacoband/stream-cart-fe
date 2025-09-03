export enum RefundStatus {
  Created = 0,
  Confirmed = 1,
  Packed = 2,
  OnDelivery = 3,
  Delivered = 4,
  Completed = 5,
  Refunded = 6,
  Rejected = 7,
}

export interface RefundItemDto {
  orderItemId: string
  reason: string
  imageUrl?: string | null
}

export interface CreateRefundRequestDto {
  orderId: string
  refundItems: RefundItemDto[]
}

export interface UpdateRefundStatusDto {
  refundRequestId: string
  newStatus: RefundStatus
}

export interface ConfirmRefundDto {
  isApproved: boolean
  reason?: string | null
}

/* Optional: kiểu dữ liệu trả về tuỳ bạn có muốn map chặt không */
export interface RefundDetailDto {
  id: string
  orderItemId: string
  refundRequestId: string
  reason: string
  imageUrl?: string | null
  unitPrice: number
  createdAt: string
  createdBy: string
  transactionId?: string | null
}

export interface RefundRequestDto {
  id: string
  orderId: string
  trackingCode?: string | null
  requestedByUserId: string
  requestedAt: string
  status: RefundStatus
  processedByUserId?: string | null
  processedAt?: string | null
  refundAmount: number
  shippingFee: number
  totalAmount: number
  refundDetails: RefundDetailDto[]
  createdAt: string
  createdBy: string
  lastModifiedAt?: string | null
  lastModifiedBy?: string | null
  transactionId?: string | null
}
