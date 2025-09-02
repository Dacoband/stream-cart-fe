'use client'

import React, { useEffect, useState, useMemo } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import Link from 'next/link'
import { PackageSearch } from 'lucide-react'

import { getOrders } from '@/services/api/order/order'
import { getshopById } from '@/services/api/shop/shop'
import { type Order } from '@/types/order/order'
import { formatFullDateTimeVN } from '@/components/common/formatFullDateTimeVN'
import PriceTag from '@/components/common/PriceTag'

// === Status mapping ===
const renderStatus = (status: number) => {
  switch (status) {
    case 1:
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
          Chờ xác nhận
        </span>
      )
    case 2:
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700">
          Chờ đóng gói
        </span>
      )
    case 3:
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
          Chờ lấy hàng
        </span>
      )
    case 7:
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
          Chờ giao hàng
        </span>
      )
    case 4:
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
          Giao thành công
        </span>
      )
    case 10:
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
          Thành công
        </span>
      )
    case 5:
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
          Đã hủy
        </span>
      )
    default:
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
          Đang giao
        </span>
      )
  }
}

// === Payment mapping ===
const renderPayment = (method?: string) => {
  if (method === 'COD') return 'Thanh toán COD'
  if (method === 'BankTransfer') return 'Thanh toán QR'
  return 'Không xác định'
}

type TabValue = 'all' | '1' | '2' | '3' | '4,10' | '5,8,9'

const parseStatusesFromTab = (tab: TabValue): number[] | undefined =>
  tab === 'all' ? undefined : tab.split(',').map((s) => Number(s.trim()))

type Props = {
  filters: {
    shopId: string | null
    startDate: Date | null
    endDate: Date | null
    statuses: number[] | null
  }
}

export const AllOrderList: React.FC<Props> = ({ filters }) => {
  const [activeTab, setActiveTab] = useState<TabValue>('all')
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [shopMap, setShopMap] = useState<Record<string, string>>({})

  const tabStatuses = useMemo(
    () => parseStatusesFromTab(activeTab),
    [activeTab]
  )

  // Fetch orders
  useEffect(() => {
    let cancelled = false
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const res = await getOrders({
          shopId: filters.shopId || undefined,
          startDate: filters.startDate?.toISOString(),
          endDate: filters.endDate?.toISOString(),
        })
        if (!cancelled) setOrders(res?.items ?? [])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchOrders()
    return () => {
      cancelled = true
    }
  }, [filters.shopId, filters.startDate, filters.endDate])

  // Fetch shop names for orders
  useEffect(() => {
    const fetchShops = async () => {
      const uniqueShopIds = Array.from(
        new Set(orders.map((o) => o.shopId))
      ).filter(Boolean)
      const missing = uniqueShopIds.filter((id) => !(id in shopMap))

      if (missing.length > 0) {
        const results = await Promise.all(
          missing.map(async (id) => {
            try {
              const shop = await getshopById(id)
              return [id, shop?.shopName ?? '—'] as const
            } catch {
              return [id, '—'] as const
            }
          })
        )
        setShopMap((prev) => {
          const next = { ...prev }
          for (const [id, name] of results) next[id] = name
          return next
        })
      }
    }
    if (orders.length > 0) fetchShops()
  }, [orders, shopMap])

  // Filter orders FE
  const filteredOrders = useMemo(() => {
    let result = orders
    if (tabStatuses)
      result = result.filter((o) => tabStatuses.includes(o.orderStatus))
    else result = result.filter((o) => o.orderStatus !== 0)

    if (filters.statuses) {
      result = result.filter((o) => filters.statuses!.includes(o.orderStatus))
    }
    return result
  }, [orders, tabStatuses, filters.statuses])

  return (
    <Card className="bg-white py-5 px-8 min-h-[75vh]">
      <TabsPrimitive.Root
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
      >
        {/* Tabs */}
        <TabsPrimitive.List className="flex gap-2 mb-4 border-b overflow-x-auto no-scrollbar -mx-8 px-8">
          {[
            { value: 'all', label: 'Tất Cả' },
            { value: '1', label: 'Chờ xác nhận' },
            { value: '2', label: 'Chờ lấy hàng' },
            { value: '3', label: 'Đang giao' },
            { value: '4,10', label: 'Đã giao' },
            { value: '5,8,9', label: 'Trả hàng/Hủy' },
          ].map((tab) => (
            <TabsPrimitive.Trigger
              key={tab.value}
              value={tab.value as TabValue}
              className="px-3 py-2 -mb-px border-b-2 border-transparent
                         data-[state=active]:border-lime-600
                         data-[state=active]:text-lime-600
                         data-[state=active]:font-medium
                         flex-none whitespace-nowrap"
            >
              {tab.label}
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>

        {/* Sticky header (Cửa hàng lên cột đầu) */}
        <div className="sticky top-16 z-30 grid grid-cols-[1.5fr_2.5fr_1.5fr_1.5fr_1.5fr_1fr] bg-[#B0F847] px-5 py-2 font-semibold text-gray-800 shadow-sm">
          <div className="pr-2">Cửa hàng</div>
          <div>Sản phẩm</div>
          <div>Tổng thanh toán</div>
          <div>Hình thức thanh toán</div>
          <div>Trạng thái</div>
          <div className="justify-self-end">Thao tác</div>
        </div>

        {/* Scrollable content */}
        <div className="max-h-[calc(75vh-100px)] overflow-y-auto">
          <TabsPrimitive.Content value={activeTab}>
            {loading ? (
              <Skeleton className="h-24 w-full" />
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Không có đơn hàng
              </div>
            ) : (
              filteredOrders.map((order) => {
                const firstItem = order.items?.[0]
                return (
                  <Card
                    key={order.id}
                    className="p-0 rounded-none mb-5 shadow-none"
                  >
                    <CardTitle className="bg-gray-100">
                      <div className="flex justify-between px-5 py-2.5 text-sm text-gray-500">
                        <span>
                          Thời gian đặt: {formatFullDateTimeVN(order.orderDate)}
                        </span>
                        <span>Mã đơn: {order.orderCode}</span>
                      </div>
                    </CardTitle>
                    <CardContent className="grid grid-cols-[1.5fr_2.5fr_1.5fr_1.5fr_1.5fr_1fr] px-5 py-3">
                      {/* Shop (moved to first column) */}
                      <div className="text-gray-700 font-medium truncate pr-4">
                        {shopMap[order.shopId] ?? order.shopId}
                      </div>

                      {/* Product (now second column) */}
                      <div className="flex gap-3 min-w-0">
                        {firstItem && (
                          <Image
                            src={
                              firstItem.productImageUrl ||
                              '/assets/emptydata.png'
                            }
                            alt={firstItem.productName || 'Sản phẩm'}
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover"
                          />
                        )}
                        <div className="flex flex-col flex-1 min-w-0">
                          <p className="font-medium truncate line-clamp-2 text-gray-700">
                            {firstItem?.productName}
                          </p>
                          <p className="text-sm text-gray-500">
                            x {firstItem?.quantity}
                          </p>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-rose-600 font-medium">
                        <PriceTag value={order.finalAmount} />
                      </div>

                      {/* Payment */}
                      <div>{renderPayment(order.paymentMethod)}</div>

                      {/* Status */}
                      <div>{renderStatus(order.orderStatus)}</div>

                      {/* Action */}
                      <div className="justify-self-end">
                        <Link href={`/orders/${order.id}`}>
                          <button className="text-blue-500 hover:underline flex items-center gap-1">
                            <PackageSearch size={16} /> Chi tiết
                          </button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsPrimitive.Content>
        </div>
      </TabsPrimitive.Root>
    </Card>
  )
}
