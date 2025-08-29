'use client'

import React from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

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
import { getUserByShopId } from '@/services/api/auth/account'
import Filters from './components/Filter'
import AdminTxTable from './components/AdminTxTable'
import DetailsModal from './components/DetailTransaction'

/* =====================
   TYPES (gộp trong page)
===================== */
type TxStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELED' | 'RETRY'

type Row = {
  id: string
  shopId: string
  shopName?: string
  ownerName?: string
  ownerPhone?: string
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

/* =====================
   UTILS (gộp trong page)
===================== */
const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    n
  )

const formatFullDateTimeVN = (d: string | Date) => {
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

// Map status BE → UI literal, tách riêng Retry
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

const StatusBadge = ({ status }: { status: TxStatus }) => {
  const { cls, label } =
    status === 'COMPLETED'
      ? {
          cls: 'bg-green-100 text-green-700 border-green-200',
          label: 'Hoàn thành',
        }
      : status === 'PENDING'
      ? {
          cls: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          label: 'Đang xử lý',
        }
      : status === 'RETRY'
      ? {
          cls: 'bg-orange-100 text-orange-700 border-orange-200',
          label: 'Xử lý lại',
        }
      : status === 'CANCELED'
      ? { cls: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Đã hủy' }
      : { cls: 'bg-red-100 text-red-700 border-red-200', label: 'Thất bại' }
  return (
    <span className={`inline-flex px-2 py-1 rounded border text-xs ${cls}`}>
      {label}
    </span>
  )
}

const DateCell = ({
  createdAt,
  processedAt,
}: {
  createdAt: string | Date
  processedAt?: string | Date | null
}) => (
  <div className="flex flex-col">
    <span>{formatFullDateTimeVN(createdAt)}</span>
    {processedAt && (
      <span className="text-xs text-muted-foreground">
        Xử lý: {formatFullDateTimeVN(processedAt)}
      </span>
    )}
  </div>
)

/* =====================
   PAGE
===================== */
export default function AdminTransactionsPage() {
  // Tabs
  const [tab, setTab] = React.useState<'all' | 'needs'>('all')

  // Filters
  const [fromDate, setFromDate] = React.useState('')
  const [toDate, setToDate] = React.useState('')
  const [typeFilter, setTypeFilter] = React.useState<number | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = React.useState<number | 'ALL'>('ALL')
  const [shopId, setShopId] = React.useState<string>('ALL')
  const [shopOptions, setShopOptions] = React.useState<ShopOption[]>([
    { id: 'ALL', shopName: '— Tất cả shop —' },
  ])

  // Pagination
  const [pageIndex, setPageIndex] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)
  const [totalPage, setTotalPage] = React.useState(1)

  // Data
  const [rows, setRows] = React.useState<Row[]>([])
  const [loading, setLoading] = React.useState(false)

  // Details
  const [detailsOpen, setDetailsOpen] = React.useState(false)
  const [detailsLoading, setDetailsLoading] = React.useState(false)
  const [detailsTx, setDetailsTx] = React.useState<Row | undefined>(undefined)

  // seller + ví (cho modal)
  const [sellerPhone, setSellerPhone] = React.useState<string | undefined>()
  const [walletBankName, setWalletBankName] = React.useState<
    string | undefined
  >()
  const [walletBankNumber, setWalletBankNumber] = React.useState<
    string | undefined
  >()

  // Load shops
  React.useEffect(() => {
    ;(async () => {
      try {
        const res = await getAllShops({
          pageNumber: 1,
          pageSize: 50,
          status: '',
          approvalStatus: '',
          searchTerm: '',
          sortBy: 'createdAt',
          ascending: false,
        })
        const list = (res?.data?.items ?? res?.items ?? []) as {
          id: string
          shopName: string
        }[]
        setShopOptions([{ id: 'ALL', shopName: '— Tất cả shop —' }, ...list])
      } catch {
        // giữ default
      }
    })()
  }, [])

  // Fetch
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

      // Tab "Cần xử lý" → không gửi Status để lấy đầy đủ, lọc client để gom 'RETRY'
      const statuses =
        tab === 'needs' || statusFilter === 'ALL' ? undefined : [statusFilter]

      const res = await filterWalletTransactions({
        ShopId: shopId === 'ALL' ? '' : shopId, // nếu BE bắt buộc ShopId, nên có endpoint admin riêng
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
        shopId: it.shopId ?? it.walletId, // chỉnh nếu BE trả shopId riêng
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

  // Actions
  const handleConfirm = async (id: string) => {
    try {
      await updateWalletTransactionStatus(id, WalletTransactionStatus.Success)
      toast.success('Xác nhận giao dịch thành công')
      fetchData()
    } catch {
      toast.error('Xác nhận giao dịch thất bại')
    }
  }

  const handleDetails = async (tx: Row) => {
    setDetailsTx(tx)
    setDetailsOpen(true)
    setDetailsLoading(true)
    setSellerPhone(undefined)
    setWalletBankName(undefined)
    setWalletBankNumber(undefined)

    try {
      // Shop + Seller
      const shop = await getshopById(tx.shopId)
      const owner = await getUserByShopId(tx.shopId)
      setDetailsTx((prev) => ({
        ...(prev as Row),
        shopName: shop?.data?.shopName ?? shop?.shopName ?? prev?.shopName,
        ownerName: owner?.fullname ?? owner?.username ?? prev?.ownerName,
        ownerId: owner?.id ?? prev?.ownerId,
      }))
      setSellerPhone(owner?.phoneNumber)

      // Ví (tên NH & STK)
      const wallet = await getWalletShopId(tx.shopId)
      const w = (wallet?.data ?? wallet) as {
        bankName?: string
        bankAccountNumber?: string
      }
      setWalletBankName(w?.bankName)
      setWalletBankNumber(w?.bankAccountNumber)
    } catch {
      // ignore
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
    <div className="p-6 flex flex-col gap-4">
      <h1 className="text-xl font-bold">Quản lý giao dịch (Admin)</h1>

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
        pageSize={pageSize}
        setPageSize={(n) => {
          setPageSize(n)
          setPageIndex(1)
        }}
        onReset={onResetFilters}
        onApply={fetchData}
        disabledStatus={tab === 'needs'}
        loading={loading}
      />

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as typeof tab)
          setPageIndex(1)
        }}
      >
        <TabsList className="bg-gray-100">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="needs">Cần xử lý</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <AdminTxTable<Row>
            rows={rows}
            loading={loading}
            onConfirm={handleConfirm}
            onDetails={handleDetails}
            showConfirm={false} // hoặc true ở tab "needs"
            renderStatus={(s) => <StatusBadge status={s as TxStatus} />}
            renderDate={(c, p) => <DateCell createdAt={c} processedAt={p} />}
            formatCurrency={formatVND}
          />
        </TabsContent>

        <TabsContent value="needs">
          <AdminTxTable<Row>
            rows={rows}
            loading={loading}
            onConfirm={handleConfirm}
            onDetails={handleDetails}
            showConfirm={false} // hoặc true ở tab "needs"
            renderStatus={(s) => <StatusBadge status={s as TxStatus} />}
            renderDate={(c, p) => <DateCell createdAt={c} processedAt={p} />}
            formatCurrency={formatVND}
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
        sellerPhone={sellerPhone}
        walletBankName={walletBankName}
        walletBankNumber={walletBankNumber}
        renderStatus={(s) => <StatusBadge status={s as TxStatus} />}
        formatCurrency={formatVND}
        formatDateTime={formatFullDateTimeVN}
      />
    </div>
  )
}
