import rootApi from '@/services/rootApi'
import {
  CreateWalletTransactionDTO,
  FilterWalletTransactionDTO,
  ListWalletTransactionDTO,
  WalletTransactionDTO,
  WalletTransactionStatus,
} from '@/types/wallet/walletTransactionDTO'

const authHeaders = () => {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Not found token.')
  return { Authorization: `Bearer ${token}` }
}

export const createWalletTransaction = async (
  payload: CreateWalletTransactionDTO
): Promise<WalletTransactionDTO> => {
  const response = await rootApi.post('/shop-wallet', payload, {
    headers: { ...authHeaders() },
  })
  return response.data?.data ?? response.data
}

export const getWalletTransactionById = async (
  id: string
): Promise<WalletTransactionDTO> => {
  const response = await rootApi.get(`/shop-wallet/${id}`, {
    headers: { ...authHeaders() },
  })
  return response.data?.data ?? response.data
}

export const filterWalletTransactions = async (
  filter: FilterWalletTransactionDTO
): Promise<ListWalletTransactionDTO> => {
  const sp = new URLSearchParams()

  // bắt buộc
  sp.set('ShopId', filter.ShopId)

  // Types: lặp key không có []  -> Types=0&Types=1...
  const types = Array.isArray(filter.Types) ? filter.Types : [filter.Types]
  types.forEach((t) => sp.append('Types', String(t)))

  // Status: tương tự Types
  if (typeof filter.Status !== 'undefined') {
    const statuses = Array.isArray(filter.Status)
      ? filter.Status
      : [filter.Status]
    statuses.forEach((s) => sp.append('Status', String(s)))
  }

  // optional
  if (filter.FromTime) sp.set('FromTime', filter.FromTime)
  if (filter.ToTime) sp.set('ToTime', filter.ToTime)
  if (typeof filter.PageIndex !== 'undefined')
    sp.set('PageIndex', String(filter.PageIndex))
  if (typeof filter.PageSize !== 'undefined')
    sp.set('PageSize', String(filter.PageSize))

  // tự gắn query để tránh Axios thêm []
  const url = `/shop-wallet?${sp.toString()}`

  const response = await rootApi.get(url, {
    headers: { ...authHeaders() },
  })

  // backend có thể bọc data hoặc trả thẳng
  const raw = (response.data?.data ?? response.data) as {
    items?: WalletTransactionDTO[]
    totalCount?: number
    totalItems?: number
    totalPage?: number
    pageCount?: number
  }

  const items = Array.isArray(raw.items) ? raw.items : []
  const totalCount =
    typeof raw.totalCount === 'number'
      ? raw.totalCount
      : typeof raw.totalItems === 'number'
      ? raw.totalItems
      : items.length

  const totalPage =
    typeof raw.totalPage === 'number'
      ? raw.totalPage
      : typeof raw.pageCount === 'number'
      ? raw.pageCount
      : 1

  return { items, totalCount, totalPage }
}

export const updateWalletTransactionStatus = async (
  id: string,
  status: WalletTransactionStatus
): Promise<WalletTransactionDTO> => {
  const response = await rootApi.patch(
    `/shop-wallet/${id}`,
    { status },
    { headers: { ...authHeaders() } }
  )
  return response.data?.data ?? response.data
}
