'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'

// Hình dạng tối thiểu của 1 dòng
type BaseRow = {
  id: string
  shopId: string
  shopName?: string
  type: number | string
  amount: number
  status: unknown // để parent quyết định kiểu thật
  createdAt: string
  processedAt?: string | null
  transactionId?: string | null
  bankName?: string
  bankNumber?: string
}

type Props<T extends BaseRow> = {
  rows: T[]
  loading: boolean
  showConfirm: boolean
  onConfirm: (id: string) => void
  onDetails: (tx: T) => void | Promise<void>

  // helpers do parent truyền xuống
  renderStatus: (s: T['status']) => React.ReactNode
  renderDate: (
    createdAt: string,
    processedAt?: string | null
  ) => React.ReactNode
  formatCurrency: (n: number) => string
}

export default function AdminTxTable<T extends BaseRow>({
  rows,
  loading,
  showConfirm,
  onConfirm,
  onDetails,
  renderStatus,
  renderDate,
  formatCurrency,
}: Props<T>) {
  return (
    <div className="bg-white border rounded-lg">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead>Thời gian</TableHead>
            <TableHead>Shop</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead className="text-right">Số tiền</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngân hàng</TableHead>
            <TableHead>Mã GD</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8}>Đang tải...</TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8}>Không có giao dịch</TableCell>
            </TableRow>
          ) : (
            rows.map((r) => {
              const st = String(r.status).toUpperCase() // để check PENDING/RETRY
              return (
                <TableRow key={r.id}>
                  <TableCell>
                    {renderDate(r.createdAt, r.processedAt ?? null)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{r.shopName ?? '—'}</span>
                      <span className="text-xs text-muted-foreground">
                        {r.shopId}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{String(r.type)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(r.amount)}
                  </TableCell>
                  <TableCell>{renderStatus(r.status)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{r.bankName ?? '—'}</span>
                      <span className="text-xs text-muted-foreground">
                        {r.bankNumber ?? '—'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{r.transactionId ?? '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {showConfirm && (st === 'PENDING' || st === 'RETRY') && (
                        <Button size="sm" onClick={() => onConfirm(r.id)}>
                          Xác nhận
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDetails(r)}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
