'use client'

import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatFullDateTimeVN } from '@/components/common/formatFullDateTimeVN'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'

export type TxStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELED'

export type Row = {
  id: string
  bankName?: string
  bankAccountNumber?: string
  bankAccountName?: string
  amount: number
  fee?: number
  netAmount?: number
  status: TxStatus
  createdAt: string | Date
  processedAt?: string | Date | null
  transactionId?: string | null
  description?: string | null
}

export interface Props {
  rows: Row[] // bắt buộc, không còn undefined
  typeLabel?: string
  accountHeaderLabel?: string
  amountPositive?: boolean
  showDetails?: boolean
  hideTransactionId?: boolean
}

function formatVND(n?: number) {
  return typeof n === 'number'
    ? new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(n)
    : '—'
}

const statusBadge = (status: TxStatus) => {
  switch (status) {
    case 'COMPLETED':
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          Hoàn thành
        </Badge>
      )
    case 'PENDING':
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
          Đang xử lý
        </Badge>
      )
    case 'CANCELED':
      return (
        <Badge className="bg-gray-100 text-gray-700 border-gray-200">
          Đã hủy
        </Badge>
      )
    default:
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">
          Thất bại
        </Badge>
      )
  }
}

export default function TableTransaction({
  rows,
  typeLabel = 'Yêu cầu rút tiền',
  accountHeaderLabel = 'Tài khoản',
  amountPositive = false,
  showDetails = false,
  hideTransactionId = false,
}: Props) {
  return (
    <Table>
      <TableHeader className="bg-[#B0F847]/50">
        <TableRow>
          <TableHead className="font-semibold pl-6">Loại</TableHead>
          <TableHead className="font-semibold">{accountHeaderLabel}</TableHead>
          <TableHead className="font-semibold text-right">Số tiền</TableHead>
          <TableHead className="font-semibold">Trạng thái</TableHead>
          <TableHead className="font-semibold">Thời gian</TableHead>
          {!hideTransactionId && (
            <TableHead className="font-semibold">Mã GD</TableHead>
          )}
          {showDetails && (
            <TableHead className="font-semibold">Chi tiết</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((it) => (
          <TableRow key={it.id} className="align-middle">
            <TableCell className="font-medium">
              <div className="flex items-center gap-3 py-2">
                <div
                  className={
                    amountPositive
                      ? 'w-8 h-8 rounded-md bg-green-100 flex items-center justify-center'
                      : 'w-8 h-8 rounded-md bg-red-100 flex items-center justify-center'
                  }
                >
                  <span
                    className={
                      amountPositive ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    {amountPositive ? (
                      <ArrowUpRight size={18} />
                    ) : (
                      <ArrowDownLeft size={18} />
                    )}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{typeLabel}</span>
                </div>
              </div>
            </TableCell>

            <TableCell>
              <div className="flex flex-col">
                <span className="text-foreground flex gap-2">
                  <span>{it.bankName ?? '—'}</span>
                  <span>-</span>
                  <span>{it.bankAccountNumber ?? '—'}</span>
                </span>
              </div>
            </TableCell>

            <TableCell>
              <div className="flex flex-col items-end">
                <span
                  className={
                    amountPositive
                      ? 'text-green-600 font-medium'
                      : 'text-red-600 font-medium'
                  }
                >
                  {amountPositive
                    ? `+${formatVND(Math.abs(it.amount))}`
                    : `-${formatVND(Math.abs(it.amount))}`}
                </span>
              </div>
            </TableCell>

            <TableCell>{statusBadge(it.status)}</TableCell>

            <TableCell>
              <div className="flex flex-col">
                <span>{formatFullDateTimeVN(it.createdAt)}</span>
                {it.processedAt && (
                  <span className="text-muted-foreground text-xs">
                    Xử lý: {formatFullDateTimeVN(it.processedAt)}
                  </span>
                )}
              </div>
            </TableCell>

            {!hideTransactionId && (
              <TableCell>
                {it.transactionId ? (
                  <span className="text-foreground font-medium">
                    {it.transactionId}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
            )}

            {showDetails && (
              <TableCell>
                <span className="text-foreground">{it.description ?? '—'}</span>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
