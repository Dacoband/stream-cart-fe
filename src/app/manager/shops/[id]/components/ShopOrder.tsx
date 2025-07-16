'use client'

import React, { useState, useMemo } from 'react'
import { format, isAfter, isBefore } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'

import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Eye, CalendarIcon, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@radix-ui/react-select'
import { Select } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { OrderDetailModal } from './OrderDetailModal'
import { getOrderDetail } from '@/fake data/shop'

type Order = {
  orderId: string
  customerName: string
  totalAmount: number
  status: string
  createdAt: string
}
type OrderDetail = {
  orderId: string
  customerName: string
  totalAmount: number
  status: string
  createdAt: string
  orderCode: string
  orderDate: string
  paymentStatus: number
  shippingFee: number
  discountAmount: number
  finalAmount: number
  estimatedDeliveryDate: string
  actualDeliveryDate: string
  customerNotes: string
  trackingCode: string
  shippingAddress: {
    fullName: string
    phone: string
    addressLine1: string
    addressLine2: string
    ward: string
    district: string
    city: string
    province: string
    postalCode: string
    country: string
    state: string
    isDefault: boolean
  }
  items: {
    id: string
    productName: string
    quantity: number
    unitPrice: number
    discountAmount: number
    totalPrice: number
    productImageUrl: string
    notes: string
  }[]
}
const getOrderStatusInfo = (status: string) => {
  switch (status) {
    case 'COMPLETED':
    case 'Hoàn thành':
      return {
        label: 'Đã hoàn thành',
        icon: <CheckCircle className="w-4 h-4 text-green-500" />,
        color: 'bg-green-100 text-green-600',
      }
    case 'PENDING':
    case 'Đang xử lý':
      return {
        label: 'Đang xử lý',
        icon: <Clock className="w-4 h-4 text-yellow-500" />,
        color: 'bg-yellow-100 text-yellow-600',
      }
    case 'CANCELLED':
    case 'Đã huỷ':
      return {
        label: 'Đã huỷ',
        icon: <XCircle className="w-4 h-4 text-red-500" />,
        color: 'bg-red-100 text-red-600',
      }
    default:
      return {
        label: status,
        icon: <Clock className="w-4 h-4 text-gray-400" />,
        color: 'bg-gray-100 text-gray-600',
      }
  }
}

export const ShopOrderList = ({ orders }: { orders: Order[] }) => {
  const [searchId, setSearchId] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [fromDate, setFromDate] = useState<Date | undefined>()
  const [toDate, setToDate] = useState<Date | undefined>()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(false)

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchId = order.orderId
        .toLowerCase()
        .includes(searchId.toLowerCase())
      const matchStatus =
        statusFilter === 'ALL' ||
        order.status === statusFilter ||
        getOrderStatusInfo(order.status).label === statusFilter
      const orderDate = new Date(order.createdAt)
      const matchFrom = fromDate
        ? isAfter(orderDate, fromDate) ||
          orderDate.getTime() === fromDate.getTime()
        : true
      const matchTo = toDate
        ? isBefore(orderDate, toDate) ||
          orderDate.getTime() === toDate.getTime()
        : true
      return matchId && matchStatus && matchFrom && matchTo
    })
  }, [orders, searchId, statusFilter, fromDate, toDate])

  const handleViewDetail = async (id: string) => {
    setSelectedId(id)
    setLoading(true)
    try {
      const detail = await getOrderDetail(id)
      setSelectedDetail(detail.data[0] || null)
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết đơn:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-9 gap-3 items-end">
          <div className="md:col-span-2">
            <Label htmlFor="searchId" className="mb-1 block">
              Tìm theo mã đơn
            </Label>
            <Input
              id="searchId"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Nhập mã đơn..."
              className="h-10"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="status" className="mb-1 block">
              Trạng thái
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-10 flex justify-between items-center"
                >
                  {statusFilter === 'ALL' ? 'Tất cả' : statusFilter}
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-full min-w-[140px]"
              >
                <DropdownMenuItem onClick={() => setStatusFilter('ALL')}>
                  Tất cả
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('Đang xử lý')}>
                  Đang xử lý
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter('Đã hoàn thành')}
                >
                  Đã hoàn thành
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('Đã huỷ')}>
                  Đã huỷ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="md:col-span-2">
            <Label className="mb-1 block">Từ ngày</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-10 justify-start text-left"
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {fromDate ? format(fromDate, 'dd/MM/yyyy') : 'Chọn ngày'}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={setFromDate}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="md:col-span-2">
            <Label className="mb-1 block">Đến ngày</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-10 justify-start text-left"
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {toDate ? format(toDate, 'dd/MM/yyyy') : 'Chọn ngày'}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={setToDate}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="items-end self-end justify-end col-span-1 md:col-span-1 max-w-[120px]">
            <Button
              variant="outline"
              onClick={() => {
                setSearchId('')
                setStatusFilter('ALL')
                setFromDate(undefined)
                setToDate(undefined)
              }}
            >
              Xoá lọc
            </Button>
          </div>
        </div>
        {/* Bảng đơn hàng */}

        <h2 className="text-base font-semibold">Danh sách đơn hàng</h2>

        <Table className="mt-6 border-t border-gray-200">
          <TableHeader className="bg-[#B0F847]/50">
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead className="text-center">Tổng tiền</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-center">Ngày đặt</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.orderId}>
                <TableCell>{order.orderId}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell className="text-center">
                  {order.totalAmount.toLocaleString('vi-VN')} đ
                </TableCell>
                <TableCell className="text-center">
                  {(() => {
                    const status = getOrderStatusInfo(order.status)
                    return (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${status.color}`}
                      >
                        {status.icon}
                        {status.label}
                      </span>
                    )
                  })()}
                </TableCell>
                <TableCell className="text-center">
                  {format(new Date(order.createdAt), 'dd/MM/yyyy', {
                    locale: vi,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetail(order.orderId)}
                      >
                        <Eye className="w-4 h-4 mr-1" /> Xem
                      </Button>
                    </DialogTrigger>
                    {selectedId === order.orderId && (
                      <OrderDetailModal order={selectedDetail} />
                    )}
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  )
}
