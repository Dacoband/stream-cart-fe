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
  onReset,
  onApply,
  disabledStatus,
  loading,
}: Props) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-[160px]"
          />
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-[160px]"
          />
        </div>

        <div>
          <select
            className="h-10 border rounded px-3 min-w-[180px]"
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
            className="h-10 border rounded px-3 min-w-[180px]"
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

        <div className="min-w-[220px]">
          <select
            className="h-10 border rounded px-3 w-full"
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

        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={onReset}>
            Đặt lại
          </Button>
          <Button onClick={onApply} disabled={loading}>
            Áp dụng
          </Button>
        </div>
      </div>
    </div>
  )
}
