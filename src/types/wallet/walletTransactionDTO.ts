export enum WalletTransactionType {
  Withdraw = 0,
  Deposit = 1,
  Commission = 2,
  System = 3,
}

export enum WalletTransactionStatus {
  Success = 0,
  Failed = 1,
  Pending = 2,
  Canceled = 3,
}

export interface WalletTransactionDTO {
  id: string
  type: number | WalletTransactionType | string
  amount: number
  description?: string | null
  target?: string | null
  status: number | WalletTransactionStatus | string
  bankAccount: string
  bankNumber: string
  transactionId?: string | null
  walletId: string
  shopMembershipId?: string | null
  orderId?: string | null
  refundId?: string | null
  createdAt: string
  updatedAt?: string
  lastModifiedAt?: string | null
}

export interface CreateWalletTransactionDTO {
  type: WalletTransactionType
  amount: number
  description?: string
  status?: WalletTransactionStatus
  transactionId?: string
  shopMembershipId?: string
  orderId?: string
  refundId?: string
}

export interface FilterWalletTransactionDTO {
  ShopId: string
  Types: number | number[] // chấp nhận 1 hoặc nhiều
  Status?: number | number[] // tùy chọn: 1,2... hoặc [1,2]
  FromTime?: string
  ToTime?: string
  PageIndex?: number
  PageSize?: number
}

export interface ListWalletTransactionDTO {
  items: WalletTransactionDTO[]
  totalCount: number
  totalPage: number
}
export const TX_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELED: 'CANCELED',
} as const
export type TxStatus = (typeof TX_STATUS)[keyof typeof TX_STATUS]

export type TxRow = {
  id: string
  bankName?: string // tên ngân hàng (DTO.bankAccount)
  bankAccountNumber?: string // số tài khoản (DTO.bankNumber)
  bankAccountName?: string // tên chủ TK (nếu có)
  amount: number
  fee?: number
  netAmount?: number
  status: TxStatus
  createdAt: string | Date
  processedAt?: string | Date | null
  transactionId?: string | null
  description?: string | null
}
