'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import type { LucideIcon } from 'lucide-react'

type Row = {
  id: string
  shopName?: string
  ownerName?: string
  ownerPhone?: string
  ownerEmail?: string
  ownerId?: string
  /** Thêm role để hiển thị */
  ownerRole?: number | string

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

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  loading: boolean
  tx?: Row
  renderStatus: (s: string) => React.ReactNode
  formatCurrency: (n: number) => string
  formatDateTime: (d: string | Date) => string
  Icons: {
    Store: LucideIcon
    User2: LucideIcon
    Mail: LucideIcon
    Phone: LucideIcon
    Landmark: LucideIcon
    Wallet: LucideIcon
    IdCard: LucideIcon
  }
}

/* -------- Small UI helpers -------- */
const LoadingBlock: React.FC = () => (
  <div className="space-y-3">
    <Skeleton className="h-5 w-56" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-4 w-4/6" />
  </div>
)

const Pill: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-100 ${className}`}
  >
    {children}
  </span>
)

const KV: React.FC<{ k: string; v?: React.ReactNode }> = ({ k, v }) => (
  <div className="grid grid-cols-12 py-2">
    <div className="col-span-5 md:col-span-4 text-muted-foreground">{k}</div>
    <div className="col-span-7 md:col-span-8 font-medium break-words">
      {v ?? '—'}
    </div>
  </div>
)

const SectionCard: React.FC<{
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  tone?: 'blue' | 'green' | 'violet'
}> = ({ title, icon, children, tone = 'blue' }) => {
  const toneMap = {
    blue: 'bg-blue-50/60',
    green: 'bg-emerald-50/60',
    violet: 'bg-violet-50/60',
  } as const
  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <div className={`flex items-center gap-2 px-4 py-3 ${toneMap[tone]}`}>
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold">{title}</h3>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

const DecorHeader: React.FC<{
  tx?: Row
  renderStatus: Props['renderStatus']
}> = ({ tx, renderStatus }) => {
  if (!tx) return null
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Mã giao dịch</span>
          <Pill>{tx.transactionId || tx.id}</Pill>
        </div>
        <div className="text-sm text-muted-foreground">
          Tạo lúc: <span className="font-medium">{tx.createdAt}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">{renderStatus(tx.status)}</div>
    </div>
  )
}

/* -------- Role Pill -------- */
const RolePill: React.FC<{ role?: number | string }> = ({ role }) => {
  if (role === undefined || role === null) return null
  const r = String(role)
  const map: Record<string, { label: string; cls: string }> = {
    '1': { label: 'Khách hàng', cls: 'bg-slate-100 text-slate-700' },
    '2': { label: 'Seller', cls: 'bg-blue-100 text-blue-700' },
    '3': { label: 'Moderator', cls: 'bg-violet-100 text-violet-700' },
    '4': { label: 'Admin', cls: 'bg-rose-100 text-rose-700' },
    '5': { label: 'Operation Manager', cls: 'bg-emerald-100 text-emerald-700' },
  }
  const f = map[r] || { label: `Role ${r}`, cls: 'bg-slate-100 text-slate-700' }
  return <Badge className={`px-2 ${f.cls}`}>{f.label}</Badge>
}

/* -------- Type Pill (VN) -------- */
const TypePill: React.FC<{ type?: number | string }> = ({ type }) => {
  if (typeof type === 'undefined' || type === null) return <Pill>—</Pill>
  const map = [
    { keys: [0, 'withdraw'], text: 'Rút tiền', cls: 'bg-red-100 text-red-700' },
    {
      keys: [1, 'deposit'],
      text: 'Nạp tiền',
      cls: 'bg-green-100 text-green-700',
    },
    {
      keys: [2, 'commission'],
      text: 'Hoa hồng',
      cls: 'bg-teal-100 text-teal-700',
    },
    {
      keys: [3, 'system'],
      text: 'Hệ thống',
      cls: 'bg-slate-100 text-slate-700',
    },
  ]
  const lower = String(type).toLowerCase()
  const found =
    map.find((m) => m.keys.map(String).includes(lower)) ||
    map.find((m) => m.keys.includes(type))
  return (
    <Badge className={`px-2 ${found?.cls ?? ''}`}>{found?.text ?? type}</Badge>
  )
}

const DetailsModal: React.FC<Props> = ({
  open,
  onOpenChange,
  loading,
  tx,
  renderStatus,
  formatCurrency,
  formatDateTime,
  Icons,
}) => {
  const { Store, User2, Mail, Phone, Landmark, IdCard } = Icons

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-[900px] max-w-[90vw]
          max-h-[85vh] overflow-y-auto
          sm:rounded-2xl p-0
        "
      >
        {/* Header */}
        <div className="p-5 pb-0">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl">Chi tiết giao dịch</DialogTitle>
            <DialogDescription className="text-sm">
              Thông tin chi tiết về giao dịch, shop, và ví liên quan
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {tx ? (
              <DecorHeader
                tx={{ ...tx, createdAt: formatDateTime(tx.createdAt) }}
                renderStatus={renderStatus}
              />
            ) : (
              <LoadingBlock />
            )}
          </div>

          <Separator className="my-4" />
        </div>

        {/* Body */}
        <div className="px-5 pb-5">
          <div className="grid grid-cols-1 gap-4">
            {/* Thông tin shop */}
            <SectionCard
              title="Thông tin shop"
              tone="green"
              icon={
                <span className="p-1.5 rounded-md bg-emerald-100 text-emerald-700">
                  <Store size={16} />
                </span>
              }
            >
              {loading ? (
                <LoadingBlock />
              ) : (
                <div className="grid md:grid-cols-1 gap-1">
                  <KV k="Tên shop" v={tx?.shopName} />
                  <KV
                    k="Chủ shop"
                    v={
                      <div className="flex items-center gap-2 flex-wrap">
                        <User2 size={14} className="text-slate-500" />
                        <span className="font-medium">
                          {tx?.ownerName || '—'}
                        </span>
                        {/* Hiển thị vai trò nếu có */}
                        <RolePill role={tx?.ownerRole} />
                      </div>
                    }
                  />
                  <KV
                    k="Email"
                    v={
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-slate-500" />
                        <span>{tx?.ownerEmail || '—'}</span>
                      </div>
                    }
                  />
                  <KV
                    k="Số điện thoại"
                    v={
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-slate-500" />
                        <span>{tx?.ownerPhone || '—'}</span>
                      </div>
                    }
                  />
                </div>
              )}
            </SectionCard>

            {/* Thông tin giao dịch */}
            <SectionCard
              title="Thông tin giao dịch"
              tone="violet"
              icon={
                <span className="p-1.5 rounded-md bg-violet-100 text-violet-700">
                  <IdCard size={16} />
                </span>
              }
            >
              {loading ? (
                <LoadingBlock />
              ) : (
                <div className="grid md:grid-cols-1 gap-1">
                  <KV k="Loại giao dịch" v={<TypePill type={tx?.type} />} />
                  <KV k="Trạng thái" v={tx && renderStatus(tx.status)} />
                  <KV
                    k="Số tiền"
                    v={
                      tx ? (
                        <span className="font-semibold">
                          {formatCurrency(Math.abs(tx.amount))}
                        </span>
                      ) : (
                        '—'
                      )
                    }
                  />
                  <KV k="Mã giao dịch" v={tx?.transactionId || '—'} />
                  <KV
                    k="Thời gian tạo"
                    v={tx?.createdAt ? formatDateTime(tx.createdAt) : '—'}
                  />
                  <KV
                    k="Thời gian xử lý"
                    v={tx?.processedAt ? formatDateTime(tx.processedAt) : '—'}
                  />
                  <KV k="Mô tả" v={tx?.description || '—'} />
                  <KV k="Tạo bởi" v={tx?.createdBy || '—'} />
                  <KV k="Cập nhật bởi" v={tx?.updatedBy || '—'} />
                  <KV
                    k="Cập nhật lúc"
                    v={tx?.updatedAt ? formatDateTime(tx.updatedAt) : '—'}
                  />
                </div>
              )}
            </SectionCard>

            {/* Thông tin ví */}
            <SectionCard
              title="Thông tin ví"
              tone="blue"
              icon={
                <span className="p-1.5 rounded-md bg-blue-100 text-blue-700">
                  <Landmark size={16} />
                </span>
              }
            >
              {loading ? (
                <LoadingBlock />
              ) : (
                <div className="grid md:grid-cols-2 gap-2">
                  <KV k="Ngân hàng" v={tx?.bankName} />
                  <KV k="Số tài khoản" v={tx?.bankNumber} />
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DetailsModal
