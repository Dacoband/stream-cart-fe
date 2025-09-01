export interface PaymentResponse {
  qrCode: string
  paymentId: string
  totalAmount: number
  orderCount: number
  orderIds: string[]
  description: string
}

export interface WithdrawalApprovalRequest {
  walletTransactionId: string
  approvalNote?: string | null
}

export interface WithdrawalApprovalResponse {
  paymentId: string
  walletTransactionId: string
  qrCode: string
  amount: number
  bankAccount?: string | null
  bankNumber?: string | null
  description?: string | null
  createdAt: string
}
export interface DepositRequest {
  amount: number
  shopId?: string | null
  description?: string | null
}

export interface DepositResponse {
  qrCode: string
  paymentId: string
  amount: number
  shopId: string
  description: string
  createdAt: string
}
