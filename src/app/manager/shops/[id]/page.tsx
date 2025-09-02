'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'

// services
import { getShopDetail, getShopMembers } from '@/services/api/shop/shop'
import { getAddressByShopId } from '@/services/api/address/address'
import { getUserById } from '@/services/api/auth/account'
import { getPagedProducts } from '@/services/api/product/product'
import { filterWalletTransactions } from '@/services/api/wallet/walletTransaction'
import { filterShopMembership } from '@/services/api/membership/shopMembership'

// components
import ShopHeader from './components/ShopHeader'
import { ShopInfo } from './components/ShopInfo'
import { ShopProductList } from './components/ShopProduct'
import { ShopMembership } from './components/ShopMembership'
import { ShopOrderList } from './components/ShopOrder'

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
import type { User } from '@/types/auth/user'
import type { Address } from '@/types/address/address'
import type {
  WalletTransactionDTO,
  ListWalletTransactionDTO,
} from '@/types/wallet/walletTransactionDTO'
import type {
  DetailShopMembershipDTO,
  ListShopMembershipDTO,
} from '@/types/membership/shopMembership'
import { TransactionHistory } from './components/TransactionHistory'

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

// Membership item used by <ShopMembership /> list prop
// (keeps only fields that the component actually renders)
export type MembershipItem = {
  membershipId: string
  name: string
  description?: string
  price: number
  startDate: string
  endDate: string
  duration?: string
  maxProduct?: number
  maxLivestream?: number
  commission?: number
  createdAt?: string
  updatedAt?: string
}

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

const ShopDetailPage = () => {
  const params = useParams()

  const [shop, setShop] = useState<Shop | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [seller, setSeller] = useState<User | null>(null)
  const [address, setAddress] = useState<Address | null>(null)
  const [shopOwner, setShopOwner] = useState<User | null>(null)
  const [moderators, setModerators] = useState<User[]>([])
  const [transactions, setTransactions] = useState<TransactionUI[]>([])
  const [memberships, setMemberships] = useState<DetailShopMembershipDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const toDetailShopMembershipDTO = (
      m: Partial<DetailShopMembershipDTO>
    ): DetailShopMembershipDTO => {
      const now = new Date()

      const startRaw = m?.startDate ?? m?.createdAt ?? now
      const endRaw = m?.endDate ?? m?.modifiedAt ?? startRaw

      const startDate =
        startRaw instanceof Date ? startRaw : new Date(startRaw as string)
      const endDate =
        endRaw instanceof Date ? endRaw : new Date(endRaw as string)

      // Suy luận status nếu backend không trả
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
          typeof m?.remainingLivestream === 'number'
            ? m.remainingLivestream
            : 0,

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

        // optional
        maxProduct:
          typeof m?.maxProduct === 'number' ? m.maxProduct : undefined,
        commission:
          typeof m?.commission === 'number' ? m.commission : undefined,
        name: m?.name ?? null,
      }
    }

    let isMounted = true

    const fetchAll = async () => {
      if (typeof params.id !== 'string') {
        toast.error('Không tìm thấy ID shop')
        setLoading(false)
        return
      }

      try {
        const id = params.id

        // Shop detail
        const shopRes = await getShopDetail(id)
        const shopData = shopRes?.data || shopRes
        if (!isMounted) return
        setShop(shopData)

        // Address (best-effort)
        try {
          const addressRes = await getAddressByShopId(id)
          if (!isMounted) return
          setAddress(addressRes || null)
        } catch (err) {
          console.error('Error fetching address:', err)
          if (isMounted) setAddress(null)
        }

        // Owner
        try {
          if (shopData?.createdBy) {
            const owner = await getUserById(shopData.createdBy)
            if (!isMounted) return
            setShopOwner(owner || null)
          }
        } catch (err) {
          console.error('Error fetching shop owner:', err)
          if (isMounted) setShopOwner(null)
        }

        // Moderators
        try {
          const members = await getShopMembers(id)
          if (!isMounted) return
          setModerators(Array.isArray(members) ? members : [])
        } catch (err) {
          console.error('Error fetching moderators:', err)
          if (isMounted) setModerators([])
        }

        // Products
        try {
          const productsRes = await getPagedProducts({
            shopId: id,
            pageNumber: 1,
            pageSize: 50,
            activeOnly: false,
            sortOption: null,
            categoryId: null,
            inStockOnly: false,
          })
          if (!isMounted) return
          setProducts(Array.isArray(productsRes) ? productsRes : [])
        } catch (err) {
          console.error('Error fetching products:', err)
          if (isMounted) setProducts([])
        }

        // Memberships (fetch 1 lần, map đúng DetailShopMembershipDTO)
        try {
          const msRes = await filterShopMembership({
            shopId: id,
            pageIndex: 1,
            pageSize: 50,
          })

          const rawList: DetailShopMembershipDTO[] =
            msRes?.detailShopMembership ??
            msRes?.data?.detailShopMembership ??
            msRes?.items ??
            msRes ??
            []

          const mapped: DetailShopMembershipDTO[] = rawList.map(
            toDetailShopMembershipDTO
          )
          if (!isMounted) return
          setMemberships(mapped)
        } catch (err) {
          console.error('Error fetching memberships:', err)
          if (isMounted) setMemberships([])
        }

        // Transactions
        try {
          const res: ListWalletTransactionDTO = await filterWalletTransactions({
            ShopId: id,
            Types: [0, 1, 2, 3],
            PageIndex: 1,
            PageSize: 50,
          })

          const mapped: TransactionUI[] = (res.items || []).map(
            (d: WalletTransactionDTO) => ({
              transactionId: d.transactionId || d.id,
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
              orderId: d.orderId || undefined,
              refundId: d.refundId || undefined,
            })
          )
          if (!isMounted) return
          setTransactions(mapped)
        } catch (err) {
          console.error('Error fetching transactions:', err)
          if (isMounted) setTransactions([])
        }
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
            className="flex items-center justify-center gap-2 h-full px-4 text-sm md:text-base font-medium text-gray-700 leading-none transition-all duration-200 ease-in-out data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow"
          >
            <Info className="w-4 h-4" />
            Thông tin
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="flex items-center justify-center gap-2 h-full px-4 text-sm md:text-base font-medium text-gray-700 leading-none transition-all duration-200 ease-in-out data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow"
          >
            <Boxes className="w-4 h-4" />
            Sản phẩm
          </TabsTrigger>
          <TabsTrigger
            value="transaction"
            className="flex items-center justify-center gap-2 h-full px-4 text-sm md:text-base font-medium text-gray-700 leading-none transition-all duration-200 ease-in-out data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow"
          >
            <CreditCard className="w-4 h-4" />
            Giao dịch
          </TabsTrigger>
          <TabsTrigger
            value="membership"
            className="flex items-center justify-center gap-2 h-full px-4 text-sm md:text-base font-medium text-gray-700 leading-none transition-all duration-200 ease-in-out data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow"
          >
            <CalendarClock className="w-4 h-4" />
            Gói thành viên
          </TabsTrigger>
          <TabsTrigger
            value="order"
            className="flex items-center justify-center gap-2 h-full px-4 text-sm md:text-base font-medium text-gray-700 leading-none transition-all duration-200 ease-in-out data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow"
          >
            <ShoppingCart className="w-4 h-4" />
            Đơn hàng
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
          {/* pass fetched memberships to component */}
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
