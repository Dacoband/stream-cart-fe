'use client'
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { getShopDetail, getShopMembers } from '@/services/api/shop/shop'
import { getAddressByShopId } from '@/services/api/address/address'
import { getUserById } from '@/services/api/auth/account'
import { getPagedProducts } from '@/services/api/product/product'
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
import type { User } from '@/types/auth/user'
import type { Address } from '@/types/address/address'
import ShopHeader from './components/ShopHeader'
import { ShopMembership } from './components/ShopMembership'
import { ShopOrderList } from './components/ShopOrder'

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
  const [shop, setShop] = useState<Shop | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [logs, setLogs] = useState<
    { type: string; message: string; timestamp: string }[]
  >([])
  const [loading, setLoading] = useState(true)
  const [seller, setSeller] = useState<User | null>(null)
  const [address, setAddress] = useState<Address | null>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [shopOwner, setShopOwner] = useState<User | null>(null)
  const [moderators, setModerators] = useState<any[]>([])

  useEffect(() => {
    const fetchAll = async () => {
      if (typeof params.id !== 'string') {
        toast.error('Không tìm thấy ID shop')
        setLoading(false)
        return
      }

      try {
        const id = params.id

        // Fetch shop detail
        const shopRes = await getShopDetail(id)
        setShop(shopRes.data || shopRes)

        // Fetch address
        try {
          const addressRes = await getAddressByShopId(id)
          setAddress(addressRes)
        } catch (error) {
          console.error('Error fetching address:', error)
          setAddress(null)
        }

        // Fetch shop owner and moderators
        try {
          const shopData = shopRes.data || shopRes
          if (shopData?.createdBy) {
            const owner = await getUserById(shopData.createdBy)
            setShopOwner(owner)
          }
        } catch (error) {
          console.error('Error fetching shop owner:', error)
        }

        try {
          const members = await getShopMembers(id)
          console.log('member', members)
          setModerators(Array.isArray(members) ? members : [])
        } catch (error) {
          console.error('Error fetching moderators:', error)
          setModerators([])
        }

        // Fetch products for the shop
        try {
          const productsRes = await getPagedProducts({
            shopId: id,
            pageNumber: 1,
            pageSize: 50,
            activeOnly: false,
          })
          setProducts(Array.isArray(productsRes) ? productsRes : [])
        } catch (error) {
          console.error('Error fetching products:', error)
          setProducts([])
        }

        // Set empty arrays for other data that doesn't have real APIs yet
        setLogs([])
        setTransactions([])
        setSeller(null)
        setMemberships([])
        setOrders([])
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
            <ShopInfo
              shop={shop}
              seller={seller}
              address={address}
              shopOwner={shopOwner}
              moderators={moderators}
            />
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
