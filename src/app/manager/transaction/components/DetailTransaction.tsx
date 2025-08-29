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
  ownerPhone?: string
  ownerEmail?: string
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
  // helpers
  renderStatus: (s: string) => React.ReactNode
  formatCurrency: (n: number) => string
  formatDateTime: (d: string | Date) => string
  Icons: {
    Store: any
    User2: any
    Mail: any
    Phone: any
    Landmark: any
    Wallet: any
    IdCard: any
  }
}

export default function DetailsModal({
  open,
  loading,
  tx,
  onOpenChange,
  renderStatus,
  formatCurrency,
  formatDateTime,
  Icons,
}: Props) {
  const { Store, User2, Mail, Phone, Landmark, Wallet, IdCard } = Icons
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Chi tiết giao dịch</AlertDialogTitle>
          <AlertDialogDescription>
            {loading ? (
              <span>Đang tải thông tin...</span>
            ) : !tx ? (
              <span>Không có dữ liệu.</span>
            ) : (
              <div className="space-y-4">
                {/* THÔNG TIN SHOP */}
                <section className="rounded-xl border p-4 bg-gradient-to-br from-slate-50 to-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Store className="text-slate-700" size={18} />
                    <h3 className="font-semibold">Thông tin shop</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Store size={16} className="text-slate-600" />
                      <span className="text-muted-foreground">Tên shop:</span>
                      <span className="font-medium">{tx.shopName ?? '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User2 size={16} className="text-slate-600" />
                      <span className="text-muted-foreground">Chủ shop:</span>
                      <span className="font-medium">{tx.ownerName ?? '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-slate-600" />
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">
                        {tx.ownerEmail ?? '—'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-slate-600" />
                      <span className="text-muted-foreground">SĐT:</span>
                      <span className="font-medium">
                        {tx.ownerPhone ?? '—'}
                      </span>
                    </div>
                  </div>
                </section>

                {/* THÔNG TIN GIAO DỊCH */}
                <section className="rounded-xl border p-4 bg-gradient-to-br from-green-50/40 to-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="text-green-700" size={18} />
                    <h3 className="font-semibold">Thông tin giao dịch</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <IdCard size={16} className="text-green-700" />
                      <span className="text-muted-foreground">Mã GD:</span>
                      <span className="font-medium">
                        {tx.transactionId ?? '—'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IdCard size={16} className="text-green-700" />
                      <span className="text-muted-foreground">
                        ID giao dịch:
                      </span>
                      <span className="font-medium">{tx.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wallet size={16} className="text-green-700" />
                      <span className="text-muted-foreground">Số tiền:</span>
                      <span className="font-medium">
                        {formatCurrency(tx.amount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wallet size={16} className="text-green-700" />
                      <span className="text-muted-foreground">Trạng thái:</span>
                      {renderStatus(tx.status)}
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <span className="text-muted-foreground">Mô tả:</span>
                      <span className="font-medium">
                        {tx.description ?? '—'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Tạo lúc:</span>
                      <span className="font-medium">
                        {formatDateTime(tx.createdAt)}
                      </span>
                    </div>
                    {tx.processedAt && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          Xử lý lúc:
                        </span>
                        <span className="font-medium">
                          {formatDateTime(tx.processedAt)}
                        </span>
                      </div>
                    )}
                    {tx.createdBy && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Tạo bởi:</span>
                        <span className="font-medium">{tx.createdBy}</span>
                      </div>
                    )}
                    {tx.updatedBy && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          Cập nhật bởi:
                        </span>
                        <span className="font-medium">{tx.updatedBy}</span>
                      </div>
                    )}
                    {tx.updatedAt && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          Cập nhật lúc:
                        </span>
                        <span className="font-medium">
                          {formatDateTime(tx.updatedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </section>

                {/* THÔNG TIN VÍ */}
                <section className="rounded-xl border p-4 bg-gradient-to-br from-blue-50/50 to-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Landmark className="text-blue-700" size={18} />
                    <h3 className="font-semibold">Thông tin ví</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Landmark size={16} className="text-blue-700" />
                      <span className="text-muted-foreground">Ngân hàng:</span>
                      <span className="font-medium">{tx.bankName ?? '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IdCard size={16} className="text-blue-700" />
                      <span className="text-muted-foreground">
                        Số tài khoản:
                      </span>
                      <span className="font-medium">
                        {tx.bankNumber ?? '—'}
                      </span>
                    </div>
                  </div>
                </section>
              </div>
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
