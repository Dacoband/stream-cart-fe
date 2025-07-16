'use client'
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  getShopDetail,
  getShopProducts,
  getShopActivities,
  getShopAddress,
  shopseller,
  getShopTransactions,
  getShopMemberships,
  getShopOrders,
} from '@/fake data/shop'
import { ShopInfo } from '@/app/manager/shops/[id]/components/ShopInfo'
import { ShopProductList } from '@/app/manager/shops/[id]/components/ShopProduct'
import { TransactionHistory } from '@/app/manager/shops/[id]/components/TransactionHistory'
import Image from 'next/image'
import {
  Star,
  ArrowLeft,
  Info,
  ShoppingCart,
  Activity,
  Boxes,
  CreditCard,
  CalendarClock,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Shop } from '@/types/shop/shop' // adjust path if needed
import type { Product } from '@/types/product/product' // adjust path if needed
import ShopHeader from './components/ShopHeader'
import { ShopMembership } from './components/ShopMembership'
import { ShopOrderList } from './components/ShopOrder'

type SimpleProduct = { id: string; name: string; image: string; price: number }
type SimpleShop = {
  id: string
  shopName: string
  logoURL: string
  coverImageURL: string
  ratingAverage: number
  totalAverage: number
  description: string
  memberPackage: string
  completeRate: number
  totalProduct: number
  status: boolean
  totalOrder: number
  approvalStatus: boolean
  // ...add any other fields your mock provides
}

type Seller = {
  id: string
  username: string
  email: string
  phoneNumber: string
  fullname: string
  avatarURL: string
  role: number
  registrationDate: string
  lastLoginDate: string
  isActive: boolean
  isVerified: boolean
  completeRate: number
  shopId: string
  createdAt: string
  createdBy: string
  lastModifiedAt: string
  lastModifiedBy: string
}

type ShopAddress = {
  id: string
  recipientName: string
  street: string
  ward: string
  district: string
  city: string
  country: string
  postalCode: string
  phoneNumber: string
  isDefaultShipping: boolean
  latitude: number
  longitude: number
  type: number
  isActive: boolean
  accountId: string
  shopId: string
  createdAt: string
  createdBy: string
  lastModifiedAt: string
  lastModifiedBy: string
}

type Membership = {
  membershipId: string
  name: string
  description?: string
  price: number
  startDate: string
  endDate: string
  duration?: string
  maxProduct?: number
  maxLivestream?: number
  commission: number // <-- ensure this is number, not boolean or optional
  createdAt?: string
  updatedAt?: string
}
type Order = {
  orderId: string
  customerName: string
  totalAmount: number
  status: string
  createdAt: string
}
const ShopDetailPage = () => {
  const params = useParams()
  const router = useRouter()
  const [shop, setShop] = useState<SimpleShop | null>(null)
  const [products, setProducts] = useState<SimpleProduct[]>([])
  const [logs, setLogs] = useState<
    { type: string; message: string; timestamp: string }[]
  >([])
  const [loading, setLoading] = useState(true)
  const [seller, setSeller] = useState<Seller | null>(null)
  const [address, setAddress] = useState<ShopAddress | null>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const fetchAll = async () => {
      if (typeof params.id !== 'string') {
        toast.error('Không tìm thấy ID shop')
        setLoading(false)
        return
      }

      try {
        const id = params.id
        const [
          shopRes,
          prodRes,
          logRes,
          txRes,
          sellerRes,
          addressRes,
          membershipRes,
          orderRes,
        ] = await Promise.all([
          getShopDetail(id),
          getShopProducts(id),
          getShopActivities(id),
          getShopTransactions(id),
          shopseller(id),
          getShopAddress(id),
          getShopMemberships(id),
          getShopOrders(id),
        ])
        setShop(shopRes.data || shopRes)
        setProducts(prodRes.data || [])
        setLogs(logRes.data || [])
        setTransactions(txRes.data || [])
        setSeller(sellerRes.data)
        setAddress(addressRes.data)
        setMemberships(membershipRes.data)
        setOrders(orderRes.data)
      } catch (err) {
        toast.error('Không thể tải dữ liệu')
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
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
          <div className="">
            <ShopInfo shop={shop} seller={seller} address={address} />
          </div>
        </TabsContent>

        <TabsContent value="products">
          <div className="">
            <ShopProductList products={products} />
          </div>
        </TabsContent>

        <TabsContent value="transaction">
          <div className="">
            <TransactionHistory transactions={transactions} />
          </div>
        </TabsContent>
        <TabsContent value="membership">
          <div className="">
            <ShopMembership list={memberships} />
          </div>
        </TabsContent>
        <TabsContent value="order">
          <div className="">
            <ShopOrderList orders={orders} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ShopDetailPage
