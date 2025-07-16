'use client'

import React, { useState } from 'react'
import {
  CreditCard,
  DollarSign,
  RotateCcw,
  ShoppingBag,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Transaction = {
  transactionId: string
  type: 'PAYMENT' | 'REFUND' | 'WITHDRAW' | 'DEPOSIT'
  amount: number
  description: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  createdAt: string
  orderId?: string
  refundId?: string
}

const formatCurrency = (amount: number) =>
  amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })

const getIcon = (type: string) => {
  switch (type) {
    case 'PAYMENT':
      return <ShoppingBag className="w-4 h-4 text-blue-500" />
    case 'REFUND':
      return <RotateCcw className="w-4 h-4 text-yellow-500" />
    case 'WITHDRAW':
      return <CreditCard className="w-4 h-4 text-red-500" />
    case 'DEPOSIT':
      return <DollarSign className="w-4 h-4 text-green-500" />
    default:
      return <CreditCard className="w-4 h-4 text-gray-400" />
  }
}

const typeLabels = {
  ALL: 'Tất cả',
  PAYMENT: 'Thanh toán',
  REFUND: 'Hoàn tiền',
  WITHDRAW: 'Rút tiền',
  DEPOSIT: 'Nạp tiền',
}

export const TransactionHistory = ({
  transactions,
}: {
  transactions: Transaction[]
}) => {
  const [filterType, setFilterType] = useState<'ALL' | Transaction['type']>(
    'ALL'
  )

  const filtered =
    filterType === 'ALL'
      ? transactions
      : transactions.filter((t) => t.type === filterType)

  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Lịch sử giao dịch</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              {typeLabels[filterType]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.entries(typeLabels).map(([key, label]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => setFilterType(key as any)}
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {!filtered.length ? (
        <div className="text-sm text-gray-600">Không có giao dịch nào.</div>
      ) : (
        filtered.map((tx) => (
          <div
            key={tx.transactionId}
            className="flex gap-3 items-start border-b pb-3"
          >
            {getIcon(tx.type)}
            <div className="flex flex-col">
              <span className="text-sm font-medium">{tx.description}</span>
              <span className="text-sm text-gray-500">
                {formatCurrency(tx.amount)}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(tx.createdAt).toLocaleString('vi-VN')}
              </span>
            </div>
            <span
              className={`ml-auto flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full
    ${
      tx.status === 'COMPLETED'
        ? 'bg-green-100 text-green-600'
        : tx.status === 'PENDING'
        ? 'bg-yellow-100 text-yellow-600'
        : 'bg-red-100 text-red-600'
    }`}
            >
              {tx.status === 'COMPLETED' && (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Thành công</span>
                </>
              )}
              {tx.status === 'PENDING' && (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Đang xử lý</span>
                </>
              )}
              {tx.status === 'FAILED' && (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>Thất bại</span>
                </>
              )}
            </span>
          </div>
        ))
      )}
    </Card>
  )
}
