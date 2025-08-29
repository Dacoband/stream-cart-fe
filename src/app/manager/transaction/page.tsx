'use client'

import React from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  Cog,
  User2,
  Store,
  Phone,
  Mail,
  IdCard,
} from 'lucide-react'

import {
  filterWalletTransactions,
  updateWalletTransactionStatus,
} from '@/services/api/wallet/walletTransaction'
import {
  WalletTransactionDTO,
  WalletTransactionStatus,
  WalletTransactionType,
} from '@/types/wallet/walletTransactionDTO'
import { getAllShops, getshopById } from '@/services/api/shop/shop'

import { getWalletShopId } from '@/services/api/wallet/wallet'
import { getUserById, getUserByShopId } from '@/services/api/auth/account'
import Filters from './components/Filter'
import AdminTxTable from './components/AdminTxTable'
import DetailsModal from './components/DetailTransaction'

/* =====================
   TYPES + UTILS (gộp)
===================== */
type TxStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELED' | 'RETRY'

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
  status: TxStatus
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

type ShopOption = { id: string; shopName: string }

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    n
  )

const formatDT = (d: string | Date) => {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleString('vi-VN', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const toStartIso = (d?: string) =>
  d ? new Date(d + 'T00:00:00').toISOString() : undefined
const toEndIso = (d?: string) =>
  d ? new Date(d + 'T23:59:59.999').toISOString() : undefined

const mapStatusToLiteral = (s: number | string): TxStatus => {
  if (typeof s === 'number') {
    if (s === 0) return 'COMPLETED'
    if (s === 2) return 'PENDING'
    if (s === 3) return 'CANCELED'
    return 'FAILED'
  }
  const v = String(s).toLowerCase()
  if (v === 'success') return 'COMPLETED'
  if (v === 'retry') return 'RETRY'
  if (v === 'pending') return 'PENDING'
  if (v === 'canceled' || v === 'cancelled') return 'CANCELED'
  return 'FAILED'
}

// Type tiếng Việt + icon + màu
const txTypeVN = (t: number | string) => {
  const n = typeof t === 'string' ? t.toLowerCase() : t
  if (n === WalletTransactionType.Withdraw || n === 'withdraw')
    return {
      label: 'Rút tiền',
      icon: ArrowDownLeft,
      tone: 'text-red-600 bg-red-50',
    }
  if (n === WalletTransactionType.Deposit || n === 'deposit')
    return {
      label: 'Nạp tiền',
      icon: ArrowUpRight,
      tone: 'text-green-600 bg-green-50',
    }
  if (n === WalletTransactionType.Commission || n === 'commission')
    return { label: 'Hoa hồng', icon: Wallet, tone: 'text-teal-600 bg-teal-50' }
  return { label: 'Hệ thống', icon: Cog, tone: 'text-slate-700 bg-slate-50' }
}

const StatusBadge = ({ status }: { status: TxStatus }) => {
  const map = {
    COMPLETED: {
      label: 'Hoàn thành',
      cls: 'bg-green-100 text-green-700 border-green-200',
    },
    PENDING: {
      label: 'Đang xử lý',
      cls: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    },
    RETRY: {
      label: 'Xử lý lại',
      cls: 'bg-orange-100 text-orange-700 border-orange-200',
    },
    CANCELED: {
      label: 'Đã hủy',
      cls: 'bg-gray-100 text-gray-700 border-gray-200',
    },
    FAILED: {
      label: 'Thất bại',
      cls: 'bg-red-100 text-red-700 border-red-200',
    },
  } as const
  const s = map[status]
  return <Badge className={`px-2 ${s.cls}`}>{s.label}</Badge>
}

const DateCell = ({
  createdAt,
  processedAt,
}: {
  createdAt: string | Date
  processedAt?: string | Date | null
}) => (
  <div className="flex flex-col">
    <span>{formatDT(createdAt)}</span>
    {processedAt && (
      <span className="text-xs text-muted-foreground">
        Xử lý: {formatDT(processedAt)}
      </span>
    )}
  </div>
)

/* =====================
   PAGE
===================== */
export default function AdminTransactionsPage() {
  const [tab, setTab] = React.useState<'all' | 'needs'>('all')

  const [fromDate, setFromDate] = React.useState('')
  const [toDate, setToDate] = React.useState('')
  const [typeFilter, setTypeFilter] = React.useState<number | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = React.useState<number | 'ALL'>('ALL')
  const [shopId, setShopId] = React.useState<string>('ALL')
  const [shopOptions, setShopOptions] = React.useState<ShopOption[]>([
    { id: 'ALL', shopName: '— Tất cả shop —' },
  ])

  const [pageIndex, setPageIndex] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)
  const [totalPage, setTotalPage] = React.useState(1)

  const [rows, setRows] = React.useState<Row[]>([])
  const [loading, setLoading] = React.useState(false)

  // details modal
  const [detailsOpen, setDetailsOpen] = React.useState(false)
  const [detailsLoading, setDetailsLoading] = React.useState(false)
  const [detailsTx, setDetailsTx] = React.useState<Row | undefined>(undefined)

  React.useEffect(() => {
    ;(async () => {
      try {
        const res = await getAllShops({
          pageNumber: 1,
          pageSize: 100,
          status: '',
          approvalStatus: '',
          searchTerm: '',
          sortBy: 'createdAt',
          ascending: false,
        })
        console.log('shops', res)
        const list = (res?.data?.items ?? res?.items ?? []) as {
          id: string
          shopName: string
        }[]
        setShopOptions([{ id: 'ALL', shopName: '— Tất cả shop —' }, ...list])
      } catch {}
    })()
  }, [])

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      const types =
        typeFilter === 'ALL'
          ? [
              WalletTransactionType.Withdraw,
              WalletTransactionType.Deposit,
              WalletTransactionType.Commission,
              WalletTransactionType.System,
            ]
          : [typeFilter]
      const statuses =
        tab === 'needs' || statusFilter === 'ALL' ? undefined : [statusFilter]

      const res = await filterWalletTransactions({
        ShopId: shopId === 'ALL' ? '' : shopId, // nếu BE bắt buộc, cân nhắc endpoint admin riêng
        Types: types,
        Status: statuses,
        FromTime: toStartIso(fromDate),
        ToTime: toEndIso(toDate),
        PageIndex: pageIndex,
        PageSize: pageSize,
      } as any)

      const items: WalletTransactionDTO[] = res.items ?? []
      setTotalPage(res.totalPage || 1)

      const mapped: Row[] = items.map((it: any) => ({
        id: it.id,
        shopId: it.shopId ?? it.walletId,
        type: it.type,
        amount: it.amount,
        status: mapStatusToLiteral(it.status),
        createdAt: it.createdAt,
        processedAt: it.lastModifiedAt ?? it.updatedAt ?? null,
        transactionId: it.transactionId ?? null,
        description: it.description ?? null,
        bankName: it.bankAccount,
        bankNumber: it.bankNumber,
        createdBy: it.createdBy,
        updatedBy: it.lastModifiedBy ?? it.updatedBy,
        updatedAt: it.lastModifiedAt ?? it.updatedAt ?? null,
      }))

      const needRow = (r: Row) => r.status === 'PENDING' || r.status === 'RETRY'
      setRows(tab === 'needs' ? mapped.filter(needRow) : mapped)
    } catch {
      setRows([])
      toast.error('Không thể tải danh sách giao dịch.')
    } finally {
      setLoading(false)
    }
  }, [
    fromDate,
    toDate,
    typeFilter,
    statusFilter,
    shopId,
    pageIndex,
    pageSize,
    tab,
  ])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleConfirm = async (id: string) => {
    try {
      await updateWalletTransactionStatus(id, WalletTransactionStatus.Success)
      toast.success('Xác nhận giao dịch thành công')
      fetchData()
    } catch {
      toast.error('Xác nhận giao dịch thất bại')
    }
  }

  const displayNameFromId = async (idLike?: string) => {
    if (!idLike) return undefined
    const looksLikeId = /^[0-9a-f-]{20,}$/i.test(idLike)
    if (!looksLikeId) return idLike // đã là tên/email
    try {
      const u = await getUserById(idLike)
      console.log('user', u)
      return u?.fullname || u?.username || idLike
    } catch {
      return idLike
    }
  }

  const handleDetails = async (tx: Row) => {
    setDetailsTx(tx)
    setDetailsOpen(true)
    setDetailsLoading(true)
    try {
      const [shop, owner, wallet] = await Promise.all([
        getshopById(tx.shopId),
        getUserByShopId(tx.shopId),
        getWalletShopId(tx.shopId),
      ])
      const shopName = shop?.data?.shopName ?? shop?.shopName
      const ownerName = owner?.fullname ?? owner?.username
      const ownerPhone = owner?.phoneNumber
      const ownerEmail = owner?.email
      console.log('owner', owner)
      console.log('shop', shop)
      console.log('wallet', wallet)
      // resolve createdBy/updatedBy nếu là id
      const [createdByName, updatedByName] = await Promise.all([
        displayNameFromId(tx.createdBy),
        displayNameFromId(tx.updatedBy),
      ])

      const w = (wallet?.data ?? wallet) as {
        bankName?: string
        bankAccountNumber?: string
      }

      setDetailsTx((prev) => ({
        ...(prev as Row),
        shopName,
        ownerName,
        ownerPhone,
        ownerEmail,
        ownerId: owner?.id,
        createdBy: createdByName,
        updatedBy: updatedByName,
        bankName: w?.bankName ?? prev?.bankName,
        bankNumber: w?.bankAccountNumber ?? prev?.bankNumber,
      }))
    } catch {
    } finally {
      setDetailsLoading(false)
    }
  }

  const onResetFilters = () => {
    setFromDate('')
    setToDate('')
    setStatusFilter('ALL')
    setTypeFilter('ALL')
    setPageIndex(1)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="bg-white sticky top-0  z-10 h-fit w-full py-4 px-8 shadow flex flex-col gap-6">
        <div className="">
          <h2 className="text-xl font-bold  mb-1">Quản lý giao dịch</h2>
          <p className="text-black/70">Quản lý toàn bộ giao dịch của sàn</p>
        </div>
        <Filters
          fromDate={fromDate}
          toDate={toDate}
          setFromDate={setFromDate}
          setToDate={setToDate}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          shopId={shopId}
          setShopId={(v) => {
            setShopId(v)
            setPageIndex(1)
          }}
          shopOptions={shopOptions}
          onReset={onResetFilters}
          onApply={fetchData}
          disabledStatus={tab === 'needs'}
          loading={loading}
        />
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as typeof tab)
          setPageIndex(1)
        }}
      >
        {/* màu tab giống file kia */}
        <TabsList className="rounded-none bg-gray-200 border">
          <TabsTrigger
            value="all"
            className="rounded-none p-3 data-[state=active]:bg-[#B0F847]/50 data-[state=active]:text-black"
          >
            Tất cả
          </TabsTrigger>
          <TabsTrigger
            value="needs"
            className="rounded-none p-3 data-[state=active]:bg-[#B0F847]/50 data-[state=active]:text-black"
          >
            Cần xử lý
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <AdminTxTable<Row>
            rows={rows}
            loading={loading}
            onConfirm={handleConfirm}
            onDetails={handleDetails}
            showConfirm={false}
            // custom render: type (VN + icon), status, date, amount
            renderType={(t) => {
              const { label, icon: Icon, tone } = txTypeVN(t)
              return (
                <div
                  className={`inline-flex items-center gap-2 px-2 py-1 rounded ${tone}`}
                >
                  <Icon size={16} /> <span className="text-sm">{label}</span>
                </div>
              )
            }}
            renderStatus={(s) => <StatusBadge status={s as TxStatus} />}
            renderDate={(c, p) => <DateCell createdAt={c} processedAt={p} />}
            renderAmount={(t, n) => {
              const isIn =
                txTypeVN(t).label === 'Nạp tiền' ||
                txTypeVN(t).label === 'Hoa hồng'
              return (
                <span
                  className={`${
                    isIn ? 'text-green-600' : 'text-red-600'
                  } font-medium`}
                >
                  {isIn ? '+' : '-'}
                  {formatVND(Math.abs(n))}
                </span>
              )
            }}
          />
        </TabsContent>

        <TabsContent value="needs">
          <AdminTxTable<Row>
            rows={rows}
            loading={loading}
            onConfirm={handleConfirm}
            onDetails={handleDetails}
            showConfirm={true}
            renderType={(t) => {
              const { label, icon: Icon, tone } = txTypeVN(t)
              return (
                <div
                  className={`inline-flex items-center gap-2 px-2 py-1 rounded ${tone}`}
                >
                  <Icon size={16} /> <span className="text-sm">{label}</span>
                </div>
              )
            }}
            renderStatus={(s) => <StatusBadge status={s as TxStatus} />}
            renderDate={(c, p) => <DateCell createdAt={c} processedAt={p} />}
            renderAmount={(t, n) => {
              const isIn =
                txTypeVN(t).label === 'Nạp tiền' ||
                txTypeVN(t).label === 'Hoa hồng'
              return (
                <span
                  className={`${
                    isIn ? 'text-green-600' : 'text-red-600'
                  } font-medium`}
                >
                  {isIn ? '+' : '-'}
                  {formatVND(Math.abs(n))}
                </span>
              )
            }}
          />
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
          disabled={loading || pageIndex <= 1}
        >
          Trước
        </Button>
        <span>
          Trang {pageIndex}/{totalPage}
        </span>
        <Button
          variant="outline"
          onClick={() => setPageIndex((p) => Math.min(totalPage, p + 1))}
          disabled={loading || pageIndex >= totalPage}
        >
          Sau
        </Button>
      </div>

      <DetailsModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        loading={detailsLoading}
        tx={detailsTx}
        renderStatus={(s) => <StatusBadge status={s as TxStatus} />}
        formatCurrency={formatVND}
        formatDateTime={formatDT}
        // sections icons
        Icons={{ Store, User2, Mail, Phone, Landmark, Wallet, IdCard }}
      />
    </div>
  )
}
