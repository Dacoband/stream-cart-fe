import rootApi from '@/services/rootApi'
import { WalletDTO, UpdateWalletDTO } from '@/types/wallet/wallet'
export const getWalletShopId = async (shopId: string) => {
  try {
    const response = await rootApi.get(`wallets/shop/${shopId}`, {})
    console.log('wallets', response)
    return response.data
  } catch (error) {
    console.error('Error fetching wallet by shop ID:', error)
    throw new Error('Không thể tải wallet.')
  }
}
export const updateShopWalletBankingInfo = async (
  shopId: string,
  payload: UpdateWalletDTO
): Promise<WalletDTO> => {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('Not found token.')
  }
  const response = await rootApi.put(
    `/wallets/shop/${shopId}/banking-info`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
  return (response.data?.data ?? response.data) as WalletDTO
}

export const getWalletById = async (walletId: string): Promise<WalletDTO> => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Không tìm thấy token.')
    }

    const response = await rootApi.get(`/wallets/${walletId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // backend trả data hoặc { data }
    return (response.data?.data ?? response.data) as WalletDTO
  } catch (error) {
    console.error('Error fetching wallet by ID:', error)
    throw new Error('Không thể tải thông tin ví.')
  }
}
