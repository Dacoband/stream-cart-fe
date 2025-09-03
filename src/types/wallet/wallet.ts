export interface WalletDTO {
  id: string
  ownerType: string
  balance: number
  createdAt: Date
  updatedAt: Date
  bankName: string
  bankAccountNumber: string
  shopId: string
}
export interface UpdateWallet {
  bankName: string
  bankAccountName: string
}
export interface UpdateWalletDTO {
  bankName?: string
  bankAccountNumber?: string
}
