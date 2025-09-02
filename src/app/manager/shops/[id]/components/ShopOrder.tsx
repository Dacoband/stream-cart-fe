'use client'

import React, { useEffect, useMemo, useState } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import Link from 'next/link'
import { PackageSearch, UserRound } from 'lucide-react'

import { getOrdersByShop } from '@/services/api/order/order'
import { getUserById } from '@/services/api/auth/account'
import { getProductDetailById } from '@/services/api/product/product'

import { type Order } from '@/types/order/order'
import PriceTag from '@/components/common/PriceTag'
import { formatFullDateTimeVN } from '@/components/common/formatFullDateTimeVN'

type TabValue = 'all' | '1' | '2' | '3' | '4,10' | '5,8,9'

const parseStatusesFromTab = (tab: TabValue): number[] | undefined => {
  if (tab === 'all') return undefined
  return tab.split(',').map((s) => Number(s.trim()))
}

type ShopOrderListProps = {
  shopId: string
  orders?: Order[]
}

export const ShopOrderList: React.FC<ShopOrderListProps> = ({
  shopId,
  orders: injected,
}) => {
  const [activeTab, setActiveTab] = useState<TabValue>('all')
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>(injected ?? [])
  const [accountMap, setAccountMap] = useState<
    Record<string, { username: string; avatarURL: string | null }>
  >({})
  const [itemAttributes, setItemAttributes] = useState<
    Record<string, Record<string, string>>
  >({})

  const statuses = useMemo(() => parseStatusesFromTab(activeTab), [activeTab])

  useEffect(() => {
    let cancelled = false

    const fetchOrders = async () => {
      if (!shopId) return
      setLoading(true)
      try {
        let result: Order[] = []
        if (!statuses) {
          const res = await getOrdersByShop(shopId, {
            PageIndex: 1,
            PageSize: 10,
          })
          const items = (res?.data?.items ?? res?.items ?? res) as Order[]
          result = Array.isArray(items) ? items : []
          result = result.filter((o) => o.orderStatus !== 0)
        } else {
          const calls = await Promise.all(
            statuses.map((st) =>
              getOrdersByShop(shopId, {
                PageIndex: 1,
                PageSize: 10,
                Status: st,
              })
            )
          )
          const merged = calls.flatMap(
            (res) => (res?.data?.items ?? res?.items ?? res) as Order[]
          )
          const map = new Map<string, Order>()
          for (const o of merged) map.set(o.id, o)
          result = Array.from(map.values())
        }

        if (!cancelled) setOrders(result)

        const uniqueAccountIds = Array.from(
          new Set(result.map((o) => o.accountId))
        ).filter(Boolean)
        const missing = uniqueAccountIds.filter((id) => !(id in accountMap))

        if (missing.length > 0) {
          const fetched = await Promise.all(
            missing.map(async (id) => {
              try {
                const u = await getUserById(id)
                return [
                  id,
                  {
                    username: u?.username ?? '',
                    avatarURL: u?.avatarURL ?? null,
                  },
                ] as const
              } catch {
                return [id, { username: '', avatarURL: null }] as const
              }
            })
          )
          if (!cancelled) {
            setAccountMap((prev) => {
              const next = { ...prev }
              for (const [id, info] of fetched) next[id] = info
              return next
            })
          }
        }
      } catch {
        if (!cancelled) setOrders([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchOrders()
    return () => {
      cancelled = true
    }
  }, [shopId, statuses, accountMap])

  useEffect(() => {
    const fetchAttributes = async () => {
      const attrMap: Record<string, Record<string, string>> = {}
      for (const order of orders) {
        for (const item of order.items || []) {
          if (item.productId && item.variantId) {
            try {
              const detail = await getProductDetailById(item.productId)
              const variant = detail?.variants?.find(
                (v: { variantId: string }) => v.variantId === item.variantId
              )
              if (variant) {
                attrMap[item.id] = variant.attributeValues
              }
            } catch {
              /* ignore */
            }
          }
        }
      }
      setItemAttributes(attrMap)
    }
    if (orders.length > 0) fetchAttributes()
  }, [orders])

  return (
    <Card className="bg-white py-5 px-8 min-h-[75vh]">
      <TabsPrimitive.Root
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
      >
        {/* Tabs bar */}
        <TabsPrimitive.List className="flex gap-2 mb-4 border-b overflow-x-auto no-scrollbar flex-nowrap -mx-8 px-8">
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

        {/* Sticky header với màu #B0F847 */}
        <div
          className="sticky top-16 z-30
                     grid items-center px-5 py-2 text-gray-800 font-semibold
                     grid-cols-[3.5fr_2fr_2fr_2fr_1fr]
                     md:grid-cols-[3fr_1.7fr_1.7fr_1.6fr_1fr]
                     sm:grid-cols-1 sm:gap-2
                     bg-[#B0F847]/50"
        >
          <div className="min-w-0">Sản phẩm</div>
          <div className="min-w-0">Tổng thanh toán</div>
          <div className="min-w-0">Hình thức thanh toán</div>
          <div className="min-w-0">Trạng thái</div>
          <div className="min-w-0 justify-self-end sm:justify-self-start">
            Thao tác
          </div>
        </div>

        {/* Scrollable content */}
        <div className="max-h-[calc(75vh-100px)] overflow-y-auto">
          <TabsPrimitive.Content value={activeTab}>
            {loading ? (
              <>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Card
                    key={idx}
                    className="rounded-none shadow-none px-5 py-3 mb-2 grid items-center
                               grid-cols-[3.5fr_2fr_2fr_2fr_1fr]
                               md:grid-cols-[3fr_1.7fr_1.7fr_1.6fr_1fr]
                               sm:grid-cols-1 sm:gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Skeleton className="w-16 h-16" />
                      <div className="flex-1 min-w-0">
                        <Skeleton className="h-4 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-20 justify-self-end sm:justify-self-start" />
                  </Card>
                ))}
              </>
            ) : orders.length === 0 ? (
              <div>
                <Image
                  src="/assets/emptydata.png"
                  alt="No data"
                  width={180}
                  height={200}
                  className="mt-14 mx-auto"
                />
                <div className="text-center mt-4 text-xl text-lime-700/60 font-medium">
                  Hiện chưa có đơn nào
                </div>
              </div>
            ) : (
              orders.map((order) => {
                const firstItem = order.items?.[0]
                const acc = accountMap[order.accountId]
                const attrs = firstItem
                  ? itemAttributes[firstItem.id]
                  : undefined

                return (
                  <Card
                    key={order.id}
                    className="p-0 gap-0 rounded-none mb-5 shadow-none"
                  >
                    <CardTitle className="bg-gray-100">
                      <div className="flex items-center px-5 justify-between py-2.5 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-2">
                          {acc?.avatarURL ? (
                            <Image
                              src={acc.avatarURL}
                              alt={acc.username || 'user'}
                              width={28}
                              height={28}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                          ) : (
                            <UserRound size={16} className="text-gray-500" />
                          )}
                          <span className="truncate max-w-[140px]">
                            {acc?.username || '—'}
                          </span>
                          <div className="ml-2 pl-4 border-l-2 border-gray-500">
                            Thời gian đặt:{' '}
                            {formatFullDateTimeVN(order.orderDate)}
                          </div>
                        </span>
                        <span>Mã đơn: {order.orderCode}</span>
                      </div>
                    </CardTitle>

                    <CardContent
                      className="rounded-none shadow-none px-5 py-3 grid
                                 grid-cols-[3.5fr_2fr_2fr_2fr_1fr]
                                 md:grid-cols-[3fr_1.7fr_1.7fr_1.6fr_1fr]
                                 sm:grid-cols-1 sm:gap-3"
                    >
                      {/* Sản phẩm */}
                      <div className="flex gap-3 min-w-0">
                        {firstItem ? (
                          <Image
                            src={
                              firstItem.productImageUrl ||
                              '/assets/emptydata.png'
                            }
                            alt={firstItem.productName || 'Sản phẩm'}
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover rounded-none flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded" />
                        )}
                        <div className="flex flex-1 flex-col justify-start mr-0 min-w-0">
                          <div className="flex justify-between gap-2 min-w-0">
                            <p
                              title={firstItem?.productName || ''}
                              className="text-base pr-2 font-medium text-gray-700 line-clamp-2 break-words min-w-0"
                            >
                              {firstItem?.productName || '—'}
                            </p>
                            <p className="flex-shrink-0">
                              x {firstItem?.quantity ?? 0}
                            </p>
                          </div>
                          <div className="flex gap-2 text-[12.5px] mt-2 text-gray-600 min-w-0">
                            {attrs &&
                              Object.entries(attrs)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(', ')}
                          </div>
                        </div>
                      </div>

                      {/* Tổng thanh toán */}
                      <div className="text-rose-600 font-medium min-w-0">
                        <PriceTag value={order.finalAmount} />
                      </div>

                      {/* Hình thức thanh toán */}
                      <div className="min-w-0">
                        {order.paymentMethod === 'COD'
                          ? 'Thanh toán COD'
                          : order.paymentMethod === 'BankTransfer'
                          ? 'Thanh toán QR'
                          : 'Không xác định'}
                      </div>

                      {/* Trạng thái */}
                      <div className="min-w-0">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium
                            ${
                              order.orderStatus === 1
                                ? 'bg-yellow-100 text-yellow-700'
                                : order.orderStatus === 2
                                ? 'bg-orange-100 text-orange-700'
                                : order.orderStatus === 3
                                ? 'bg-blue-100 text-blue-700'
                                : order.orderStatus === 7
                                ? 'bg-indigo-100 text-indigo-700'
                                : order.orderStatus === 4
                                ? 'bg-green-100 text-green-700'
                                : order.orderStatus === 5
                                ? 'bg-red-100 text-red-700'
                                : order.orderStatus === 10
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                          {order.orderStatus === 1
                            ? 'Chờ xác nhận'
                            : order.orderStatus === 2
                            ? 'Chờ đóng gói'
                            : order.orderStatus === 3
                            ? 'Chờ lấy hàng'
                            : order.orderStatus === 7
                            ? 'Chờ giao hàng'
                            : order.orderStatus === 4
                            ? 'Giao hàng thành công'
                            : order.orderStatus === 5
                            ? 'Đã hủy'
                            : order.orderStatus === 10
                            ? 'Thành công'
                            : 'Đang giao'}
                        </span>
                      </div>

                      {/* Thao tác */}
                      <div className="justify-self-end sm:justify-self-start min-w-0">
                        <Link href={`/shop/manage-orders/${order.id}`}>
                          <button className="text-blue-500 flex text-sm items-center cursor-pointer gap-2 hover:underline">
                            <PackageSearch size={20} /> Xem chi tiết đơn
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
