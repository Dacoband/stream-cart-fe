'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'

// services
import { getShopDetail } from '@/services/api/shop/shop'
import { getAddressByShopId } from '@/services/api/address/address'
import { getUserById } from '@/services/api/auth/account'
import { getPagedProducts } from '@/services/api/product/product'
import { filterWalletTransactions } from '@/services/api/wallet/walletTransaction'
import { filterShopMembership } from '@/services/api/membership/shopMembership'
import { getModeratorsByShop } from '@/services/api/auth/moderator' // 👈 NEW

// components
import ShopHeader from './components/ShopHeader'
import { ShopInfo } from './components/ShopInfo'
import { ShopProductList } from './components/ShopProduct'
import { ShopMembership } from './components/ShopMembership'
import { ShopOrderList } from './components/ShopOrder'
import { TransactionHistory } from './components/TransactionHistory'

// icons
import {
  Info,
  ShoppingCart,
  Boxes,
  CreditCard,
  CalendarClock,
} from 'lucide-react'

// types
import type { Shop } from '@/types/shop/shop'
import type { Product } from '@/types/product/product'
import type { User, Moderator } from '@/types/auth/user' // 👈 Moderator type
import type { Address } from '@/types/address/address'
import type {
  WalletTransactionDTO,
  ListWalletTransactionDTO,
} from '@/types/wallet/walletTransactionDTO'
import type { DetailShopMembershipDTO } from '@/types/membership/shopMembership'

type TransactionUI = {
  transactionId: string
  type: 'PAYMENT' | 'REFUND' | 'WITHDRAW' | 'DEPOSIT'
  amount: number
  description: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  createdAt: string
  orderId?: string
  refundId?: string
}

// ===== Helpers map =====
function mapType(t: WalletTransactionDTO['type']): TransactionUI['type'] {
  const v = String(t).toUpperCase()
  if (v === '0' || v === 'WITHDRAW') return 'WITHDRAW'
  if (v === '1' || v === 'DEPOSIT') return 'DEPOSIT'
  if (v === '2' || v === 'COMMISSION') return 'PAYMENT'
  if (v === '3' || v === 'SYSTEM') return 'PAYMENT'
  return 'PAYMENT'
}
function mapStatus(s: WalletTransactionDTO['status']): TransactionUI['status'] {
  const v = String(s).toUpperCase()
  if (v === '0' || v === 'SUCCESS' || v === 'COMPLETED') return 'COMPLETED'
  if (v === '1' || v === 'FAILED') return 'FAILED'
  return 'PENDING'
}
function toDetailShopMembershipDTO(
  m: Partial<DetailShopMembershipDTO>
): DetailShopMembershipDTO {
  const now = new Date()
  const startRaw = m?.startDate ?? m?.createdAt ?? now
  const endRaw = m?.endDate ?? m?.modifiedAt ?? startRaw
  const startDate =
    startRaw instanceof Date ? startRaw : new Date(startRaw as string)
  const endDate = endRaw instanceof Date ? endRaw : new Date(endRaw as string)

  const inferredStatus =
    endDate.getTime() < now.getTime()
      ? 'Expired'
      : (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 7
      ? 'ExpiringSoon'
      : 'Active'

  return {
    id: m?.id ?? '',
    shopID: m?.shopID ?? '',
    startDate,
    endDate,
    remainingLivestream:
      typeof m?.remainingLivestream === 'number' ? m.remainingLivestream : 0,
    status: m?.status ?? inferredStatus,
    createdBy: m?.createdBy,
    createdAt:
      m?.createdAt instanceof Date
        ? m.createdAt
        : new Date(m?.createdAt ?? startDate),
    modifiedBy: m?.modifiedBy,
    modifiedAt: m?.modifiedAt
      ? m?.modifiedAt instanceof Date
        ? m.modifiedAt
        : new Date(m.modifiedAt as string)
      : undefined,
    isDeleted: Boolean(m?.isDeleted),
    maxProduct: typeof m?.maxProduct === 'number' ? m.maxProduct : undefined,
    commission: typeof m?.commission === 'number' ? m.commission : undefined,
    name: m?.name ?? null,
  }
}

// ===== Page component =====
const ShopDetailPage = () => {
  const params = useParams()

  const [shop, setShop] = useState<Shop | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [seller, setSeller] = useState<User | null>(null) // owner/seller
  const [address, setAddress] = useState<Address | null>(null)
  const [shopOwner, setShopOwner] = useState<User | null>(null) // optional
  const [moderators, setModerators] = useState<Moderator[]>([]) // 👈 use Moderator[]
  const [transactions, setTransactions] = useState<TransactionUI[]>([])
  const [memberships, setMemberships] = useState<DetailShopMembershipDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchAll = async () => {
      if (typeof params.id !== 'string') {
        toast.error('Không tìm thấy ID shop')
        setLoading(false)
        return
      }
      const shopId = params.id

      try {
        setLoading(true)

        // 1) Lấy thông tin shop trước để biết owner/accountId
        const shopRes = await getShopDetail(shopId)
        const shopData: Shop = (shopRes?.data || shopRes) as Shop
        if (!isMounted) return
        setShop(shopData)

        const ownerId = shopData?.accountId || shopData?.createdBy || null

        // 2) Chạy song song các API còn lại
        const [
          addressRes,
          moderatorsRes,
          ownerRes,
          productsAgg,
          membershipRes,
          txRes,
        ] = await Promise.all([
          // Address
          getAddressByShopId(shopId).catch(() => null),

          // Moderators (fetch theo mẫu getModeratorsByShop)
          getModeratorsByShop(shopId).catch(() => []),

          // Owner/seller (best-effort)
          ownerId
            ? getUserById(ownerId).catch(() => null)
            : Promise.resolve(null),

          // Products: gom nhiều trang
          (async () => {
            const all: Product[] = []
            const PAGE_SIZE = 50
            for (let page = 1; page <= 200; page++) {
              const pageData = await getPagedProducts({
                shopId,
                pageNumber: page,
                pageSize: PAGE_SIZE,
                activeOnly: false,
                sortOption: null,
                categoryId: null,
                inStockOnly: false,
              }).catch(() => [])
              const items = Array.isArray(pageData) ? pageData : []
              all.push(...items)
              if (items.length < PAGE_SIZE) break
            }
            return all
          })(),

          // Memberships
          (async () => {
            const page1 = await filterShopMembership({
              shopId,
              pageIndex: 1,
              pageSize: 100,
            }).catch(() => null)
            const rawList: DetailShopMembershipDTO[] =
              page1?.detailShopMembership ??
              page1?.data?.detailShopMembership ??
              page1?.items ??
              page1 ??
              []
            return rawList.map(toDetailShopMembershipDTO)
          })(),

          // Transactions (lấy gần đây)
          (async () => {
            const r: ListWalletTransactionDTO = await filterWalletTransactions({
              ShopId: shopId,
              Types: [0, 1, 2, 3],
              PageIndex: 1,
              PageSize: 100,
            }).catch(
              () =>
                ({
                  items: [],
                  totalCount: 0,
                  totalPage: 0,
                } as ListWalletTransactionDTO)
            )

            return (r.items || []).map((d: WalletTransactionDTO) => ({
              transactionId: (d as any).transactionId || d.id,
              type: mapType(d.type),
              amount: d.amount,
              description:
                d.description ||
                (mapType(d.type) === 'WITHDRAW'
                  ? `Rút tiền về ${d.bankAccount || 'ngân hàng'}`
                  : mapType(d.type) === 'DEPOSIT'
                  ? `Nạp tiền vào ví`
                  : 'Giao dịch ví'),
              status: mapStatus(d.status),
              createdAt: d.createdAt,
              orderId: (d as any).orderId || undefined,
              refundId: (d as any).refundId || undefined,
            }))
          })(),
        ])

        if (!isMounted) return
        setAddress(addressRes || null)
        setModerators(Array.isArray(moderatorsRes) ? moderatorsRes : [])
        setSeller(ownerRes || null)
        setShopOwner(ownerRes || null)
        setProducts(Array.isArray(productsAgg) ? productsAgg : [])
        setMemberships(Array.isArray(membershipRes) ? membershipRes : [])
        setTransactions(Array.isArray(txRes) ? txRes : [])
      } catch (err) {
        console.error(err)
        toast.error('Không thể tải dữ liệu')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchAll()
    return () => {
      isMounted = false
    }
  }, [params.id])

  if (loading) return <div className="p-8 text-center">Đang tải...</div>
  if (!shop)
    return (
      <div className="p-8 text-center text-red-500">Không tìm thấy shop</div>
    )

  return (
    <div className="max-w-6xl mx-auto p-6">
      <ShopHeader shop={shop} />

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid grid-cols-5 w-full bg-gray-100 rounded-lg shadow mb-6 overflow-hidden h-12">
          <TabsTrigger
            value="info"
            className="flex items-center justify-center gap-2 h-full px-4 text-sm md:text-base font-medium text-gray-700 leading-none data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow"
          >
            <Info className="w-4 h-4" /> Thông tin
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="flex items-center justify-center gap-2 h-full px-4 text-sm md:text-base font-medium text-gray-700 leading-none data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow"
          >
            <Boxes className="w-4 h-4" /> Sản phẩm
          </TabsTrigger>
          <TabsTrigger
            value="transaction"
            className="flex items-center justify-center gap-2 h-full px-4 text-sm md:text-base font-medium text-gray-700 leading-none data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow"
          >
            <CreditCard className="w-4 h-4" /> Giao dịch
          </TabsTrigger>
          <TabsTrigger
            value="membership"
            className="flex items-center justify-center gap-2 h-full px-4 text-sm md:text-base font-medium text-gray-700 leading-none data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow"
          >
            <CalendarClock className="w-4 h-4" /> Gói thành viên
          </TabsTrigger>
          <TabsTrigger
            value="order"
            className="flex items-center justify-center gap-2 h-full px-4 text-sm md:text-base font-medium text-gray-700 leading-none data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow"
          >
            <ShoppingCart className="w-4 h-4" /> Đơn hàng
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <ShopInfo
            shop={shop}
            seller={seller}
            address={address}
            shopOwner={shopOwner}
            moderators={moderators}
          />
        </TabsContent>

        <TabsContent value="products">
          <ShopProductList products={products} />
        </TabsContent>

        <TabsContent value="transaction">
          <TransactionHistory transactions={transactions} />
        </TabsContent>

        <TabsContent value="membership">
          <ShopMembership list={memberships} />
        </TabsContent>

        <TabsContent value="order">
          {shop?.id && <ShopOrderList shopId={shop.id} />}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ShopDetailPage
