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
import { ArrowUpRight } from 'lucide-react'

function formatVND(n?: number) {
  return typeof n === 'number'
    ? new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(n)
    : '—'
}

const badge = (status: 'COMPLETED' | 'PENDING' | 'CANCELLED') => {
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
    default:
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">Hủy</Badge>
      )
  }
}

type Row = {
  id: string
  title: string
  income: number
  createdAt: string | Date
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED'
  source?: string
}

interface Props {
  rows?: Row[]
}

export default function TableOrder({ rows }: Props) {
  const data = rows ?? []

  return (
    <Table>
      <TableHeader className="bg-[#B0F847]/50">
        <TableRow>
          <TableHead className="font-semibold pl-6">Loại</TableHead>
          <TableHead className="font-semibold">Mã đơn hàng</TableHead>
          <TableHead className="font-semibold ">Số tiền</TableHead>
          <TableHead className="font-semibold">Trạng thái</TableHead>
          <TableHead className="font-semibold">Thời gian</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((it) => (
          <TableRow key={it.id}>
            <TableCell className="">
              <div className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-md bg-green-100 flex items-center justify-center">
                  <span className="text-green-600">
                    <ArrowUpRight size={18} />
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Thu nhập</span>
                  <span className="text-muted-foreground text-xs">
                    {it.source ?? '—'}
                  </span>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span className="text-primary text-xs">#{it.id}</span>
              </div>
            </TableCell>
            <TableCell className=" text-green-600 font-medium">
              +{formatVND(it.income)}
            </TableCell>
            <TableCell>{badge(it.status)}</TableCell>
            <TableCell>{formatFullDateTimeVN(it.createdAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
