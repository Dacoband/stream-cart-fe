import rootApi from '@/services/rootApi';

export const getWalletShopId = async (
  shopId: string,

) => {
  try {
    const response = await rootApi.get(`wallets/shop/${shopId}`, {
   
    })
    console.log('wallets', response)
    return response.data
  } catch (error) {
    console.error('Error fetching wallet by shop ID:', error)
    throw new Error('Không thể tải wallet.')
  }
}