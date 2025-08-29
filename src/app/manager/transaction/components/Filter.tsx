'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  WalletTransactionStatus,
  WalletTransactionType,
} from '@/types/wallet/walletTransactionDTO'

type ShopOption = { id: string; shopName: string }

type Props = {
  fromDate: string
  toDate: string
  setFromDate: (v: string) => void
  setToDate: (v: string) => void

  typeFilter: number | 'ALL'
  setTypeFilter: (v: number | 'ALL') => void

  statusFilter: number | 'ALL'
  setStatusFilter: (v: number | 'ALL') => void

  shopId: string
  setShopId: (v: string) => void
  shopOptions: ShopOption[]

  pageSize: number
  setPageSize: (n: number) => void

  onReset: () => void
  onApply: () => void
  disabledStatus?: boolean
  loading?: boolean
}

export default function Filters({
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  shopId,
  setShopId,
  shopOptions,
  pageSize,
  setPageSize,
  onReset,
  onApply,
  disabledStatus,
  loading,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-3 bg-white p-4 border rounded-lg">
      <div className="md:col-span-2 flex gap-2">
        <Input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <Input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
      </div>

      <div>
        <select
          className="w-full h-10 border rounded px-3"
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(
              e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
            )
          }
        >
          <option value="ALL">Tất cả loại</option>
          <option value={WalletTransactionType.Withdraw}>Rút tiền</option>
          <option value={WalletTransactionType.Deposit}>Nạp tiền</option>
          <option value={WalletTransactionType.Commission}>Hoa hồng</option>
          <option value={WalletTransactionType.System}>Hệ thống</option>
        </select>
      </div>

      <div>
        <select
          className="w-full h-10 border rounded px-3"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
            )
          }
          disabled={disabledStatus}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value={WalletTransactionStatus.Success}>Hoàn thành</option>
          <option value={WalletTransactionStatus.Pending}>Đang xử lý</option>
          <option value={WalletTransactionStatus.Failed}>Thất bại</option>
          <option value={WalletTransactionStatus.Canceled}>Đã hủy</option>
        </select>
      </div>

      <div>
        <select
          className="w-full h-10 border rounded px-3"
          value={shopId}
          onChange={(e) => setShopId(e.target.value)}
        >
          {shopOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.shopName}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 items-center">
        <select
          className="h-10 border rounded px-3"
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          {[10, 20, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n}/trang
            </option>
          ))}
        </select>
        <Button variant="outline" onClick={onReset}>
          Đặt lại
        </Button>
        <Button onClick={onApply} disabled={loading}>
          Áp dụng
        </Button>
      </div>
    </div>
  )
}
