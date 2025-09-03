'use client'

import React, { useEffect, useState } from 'react'
import { FormatDate } from '@/components/common/FormatDate'
import PriceTag from '@/components/common/PriceTag'
import { Card, CardContent } from '@/components/ui/card'
import { Order } from '@/types/order/order'
import { getStatusText, OrderStatus } from '@/types/order/orderStatus'
import Image from 'next/image'
import { getProductDetailById } from '@/services/api/product/product'
import { getshopById } from '@/services/api/shop/shop'
import { Shop } from '@/types/shop/shop'
import { Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { updateOrderStatus } from '@/services/api/order/order'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { DialogAddReview } from './DialogAddReview'
import RefundRequestModal from '../(hasSidebar)/manage-orders/components/RefundRequestModal'

interface OrderItemProps {
  order: Order
}

export function OrderItem({ order }: OrderItemProps) {
  const statusText = getStatusText(order.orderStatus as OrderStatus)
  const [shop, setShop] = useState<Shop | null>(null)
  const router = useRouter()
  const [itemAttributes, setItemAttributes] = useState<
    Record<string, Record<string, string>>
  >({})
  const [cancelOpen, setCancelOpen] = useState(false)
  const [confirmReceiveOpen, setConfirmReceiveOpen] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [refundModalOpen, setRefundModalOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    const fetchShop = async () => {
      if (!order.shopId) return
      try {
        const res = await getshopById(order.shopId)
        if (!cancelled) setShop(res || null)
      } catch {
        if (!cancelled) setShop(null)
      }
    }
    fetchShop()
    return () => {
      cancelled = true
    }
  }, [order.shopId])

  useEffect(() => {
    let cancelled = false
    const fetchAttributes = async () => {
      const attrMap: Record<string, Record<string, string>> = {}
      const items = order.items || []
      if (!items.length) {
        if (!cancelled) setItemAttributes({})
        return
      }
      await Promise.all(
        items.map(async (item) => {
          try {
            if (item.productId && item.variantId) {
              const detail = await getProductDetailById(item.productId)
              const variant = detail?.variants?.find(
                (v: { variantId: string }) => v.variantId === item.variantId
              )
              if (variant?.attributeValues) {
                attrMap[item.id] = variant.attributeValues
              }
            }
          } catch {}
        })
      )
      if (!cancelled) setItemAttributes(attrMap)
    }
    fetchAttributes()
    return () => {
      cancelled = true
    }
  }, [order.items])

  const getStatusTextColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Cancelled:
      case OrderStatus.Refunded:
        return 'bg-red-600'
      case OrderStatus.Waiting:
        return 'bg-orange-600'
      default:
        return 'bg-lime-600'
    }
  }

  const cancelOrder = async () => {
    try {
      setUpdating(true)
      await updateOrderStatus(order.id, 5)
      toast.success('Đã hủy đơn hàng')
      router.refresh()
    } catch {
      toast.error('Không thể hủy đơn hàng')
    } finally {
      setUpdating(false)
    }
  }

  const confirmReceived = async () => {
    try {
      setUpdating(true)
      await updateOrderStatus(order.id, 10)
      toast.success('Xác nhận đã nhận hàng')
      router.refresh()
    } catch {
      toast.error('Không thể xác nhận đơn hàng')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Card className="mb-4 rounded-none p-0">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-col gap-1">
            <div className="flex gap-2 items-center w-full">
              <div className="text-orange-600">
                <Store size={18} />
              </div>
              <span className="font-medium text-black/80 w-full">
                {shop?.shopName || 'Cửa hàng'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-black/80 mr-2 pr-2 border-r">
              Mã đơn: {order.orderCode}
            </span>
            <span
              className={`inline-block py-1 px-2 text-xs text-white font-medium ${getStatusTextColor(
                order.orderStatus as OrderStatus
              )}`}
            >
              {statusText}
            </span>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-3">
          {order.items && order.items.length > 0 ? (
            order.items.map((item) => {
              const attrs = itemAttributes[item.id]
              return (
                <div key={item.id} className="flex gap-3">
                  <div className="w-16 h-16 relative rounded overflow-hidden bg-gray-100">
                    <Image
                      src={item.productImageUrl || '/assets/emptyData.png'}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 flex justify-between">
                    <div>
                      <div className="font-medium text-sm mb-1">
                        {item.productName}
                      </div>
                      <div>
                        <div className="flex gap-2 text-[12.5px] mt-2 text-gray-600">
                          {attrs &&
                            Object.entries(attrs)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(', ')}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        Số lượng: {item.quantity}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <PriceTag value={item.unitPrice} className="text-sm" />
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p>Không có sản phẩm nào trong đơn hàng này</p>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="border-t mt-2 py-2">
          <div className="flex justify-between items-center font-medium mt-2 mb-4">
            <span>Thành tiền:</span>
            <PriceTag
              value={order.finalAmount}
              className="text-lg text-orange-600"
            />
          </div>
        </div>

        {/* Actions */}
        <div
          className="flex justify-between mb-2"
          // chặn mọi bubbling vào vùng action để không bị click nhầm
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="space-y-1 text-sm text-gray-600">
            {order.actualDeliveryDate ? (
              <div>
                Ngày giao thực tế:{' '}
                <FormatDate date={order.actualDeliveryDate} />
              </div>
            ) : (
              <>
                <div>
                  Ngày đặt: <FormatDate date={order.orderDate} />
                </div>
                <div>
                  Ngày giao dự kiến:{' '}
                  <FormatDate date={order.estimatedDeliveryDate} />
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="rounded-none"
              onClick={() => router.push(`/customer/order-details/${order.id}`)}
            >
              Xem chi tiết
            </Button>

            {order.orderStatus === 0 && (
              <>
                <Button
                  variant="outline"
                  className="border border-rose-500 rounded-none text-rose-600 hover:bg-rose-50"
                  onClick={() => setCancelOpen(true)}
                >
                  Hủy đơn
                </Button>
                <Button
                  className="bg-[#B0F847] rounded-none text-black hover:brightness-95"
                  onClick={() =>
                    router.push(`/payment/order?orders=${order.id}`)
                  }
                >
                  Thanh toán lại
                </Button>
              </>
            )}

            {(order.orderStatus === 1 || order.orderStatus === 2) && (
              <Button
                variant="outline"
                className="border border-rose-500 text-rose-600 hover:bg-rose-50"
                onClick={() => setCancelOpen(true)}
              >
                Hủy đơn
              </Button>
            )}

            {order.orderStatus === 4 && (
              <div className="flex gap-4">
                <Button
                  type="button"
                  className=" bg-gray-200 hover:bg-gray-300 rounded-none text-black"
                  onClick={() => setRefundModalOpen(true)}
                >
                  Hoàn trả hàng
                </Button>
                <Button
                  className="bg-[#B0F847] rounded-none text-black hover:bg-[#B0F847]/80"
                  onClick={() => setConfirmReceiveOpen(true)}
                >
                  Đã nhận hàng
                </Button>
              </div>
            )}

            {order.orderStatus === 10 && (
              <Button
                variant="secondary"
                className="bg-[#B0F847] rounded-none text-black hover:bg-[#B0F847]/80"
                onClick={() => setReviewDialogOpen(true)}
              >
                Đánh giá
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      {/* Confirm cancel */}
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy đơn hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>Quay lại</AlertDialogCancel>
            <AlertDialogAction
              disabled={updating}
              className="bg-red-600 hover:bg-red-600/90 text-white"
              onClick={async () => {
                await cancelOrder()
                setCancelOpen(false)
              }}
            >
              Xác nhận hủy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm received */}
      <AlertDialog
        open={confirmReceiveOpen}
        onOpenChange={setConfirmReceiveOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận đã nhận hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn xác nhận đã nhận được hàng và sản phẩm đúng mô tả?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>Quay lại</AlertDialogCancel>
            <AlertDialogAction
              disabled={updating}
              onClick={async () => {
                await confirmReceived()
                setConfirmReceiveOpen(false)
              }}
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Review */}
      <DialogAddReview
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        order={order}
        onSuccess={() => router.refresh()}
      />

      {/* Refund modal */}
      <RefundRequestModal
        open={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        orderId={order.id}
      />
    </Card>
  )
}
