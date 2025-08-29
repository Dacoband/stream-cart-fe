'use client'

import React from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'

type Row = {
  id: string
  shopId: string
  shopName?: string
  ownerName?: string
  ownerId?: string
  type: number | string
  amount: number
  status: string
  createdAt: string
  processedAt?: string | null
  transactionId?: string | null
  description?: string | null
  bankName?: string
  bankNumber?: string
  createdBy?: string
  updatedBy?: string
  updatedAt?: string | null
}

type Props = {
  open: boolean
  loading: boolean
  tx?: Row
  onOpenChange: (open: boolean) => void

  // bổ sung
  sellerPhone?: string
  walletBankName?: string
  walletBankNumber?: string

  // helpers
  renderStatus: (s: string) => React.ReactNode
  formatCurrency: (n: number) => string
  formatDateTime: (d: string | Date) => string
}

export default function DetailsModal({
  open,
  loading,
  tx,
  onOpenChange,
  sellerPhone,
  walletBankName,
  walletBankNumber,
  renderStatus,
  formatCurrency,
  formatDateTime,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Chi tiết giao dịch</AlertDialogTitle>
          <AlertDialogDescription>
            {loading ? (
              <span>Đang tải thông tin...</span>
            ) : tx ? (
              <div className="space-y-2 text-sm">
                {/* Thông tin giao dịch */}
                <div>
                  <span className="font-medium">Mã GD: </span>
                  {tx.transactionId ?? '—'}
                </div>
                <div>
                  <span className="font-medium">Giao dịch ID: </span>
                  {tx.id}
                </div>
                <div>
                  <span className="font-medium">Loại: </span>
                  {String(tx.type)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Trạng thái: </span>
                  {renderStatus(tx.status)}
                </div>
                <div>
                  <span className="font-medium">Số tiền: </span>
                  {formatCurrency(tx.amount)}
                </div>
                <div>
                  <span className="font-medium">Mô tả: </span>
                  {tx.description ?? '—'}
                </div>
                <div>
                  <span className="font-medium">Thời gian tạo: </span>
                  {formatDateTime(tx.createdAt)}
                </div>
                {tx.processedAt && (
                  <div>
                    <span className="font-medium">Thời gian xử lý: </span>
                    {formatDateTime(tx.processedAt)}
                  </div>
                )}

                {/* Tạo/Cập nhật bởi ai, lúc nào */}
                {(tx.createdBy || tx.updatedBy || tx.updatedAt) && (
                  <div className="pt-2 border-t" />
                )}
                {tx.createdBy && (
                  <div>
                    <span className="font-medium">Tạo bởi: </span>
                    {tx.createdBy}
                  </div>
                )}
                {tx.updatedBy && (
                  <div>
                    <span className="font-medium">Cập nhật bởi: </span>
                    {tx.updatedBy}
                  </div>
                )}
                {tx.updatedAt && (
                  <div>
                    <span className="font-medium">Cập nhật lúc: </span>
                    {formatDateTime(tx.updatedAt)}
                  </div>
                )}

                {/* Seller */}
                <div className="pt-2 border-t" />
                <div>
                  <span className="font-medium">Shop ID: </span>
                  {tx.shopId}
                </div>
                <div>
                  <span className="font-medium">Tên shop: </span>
                  {tx.shopName ?? '—'}
                </div>
                <div>
                  <span className="font-medium">Chủ shop (seller): </span>
                  {tx.ownerName ?? '—'}
                </div>
                <div>
                  <span className="font-medium">ID seller: </span>
                  {tx.ownerId ?? '—'}
                </div>
                <div>
                  <span className="font-medium">SĐT seller: </span>
                  {sellerPhone ?? '—'}
                </div>

                {/* Ví */}
                <div className="pt-2 border-t" />
                <div>
                  <span className="font-medium">Ngân hàng (từ ví): </span>
                  {walletBankName ?? tx.bankName ?? '—'}
                </div>
                <div>
                  <span className="font-medium">Số tài khoản (từ ví): </span>
                  {walletBankNumber ?? tx.bankNumber ?? '—'}
                </div>
              </div>
            ) : (
              <span>Không có dữ liệu.</span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Đóng</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
