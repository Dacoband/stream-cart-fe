'use client'

import React from 'react'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Wallet, Banknote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/AuthContext'
import {
  getWalletShopId,
  updateShopWalletBankingInfo,
} from '@/services/api/wallet/wallet'
import { WalletDTO } from '@/types/wallet/wallet'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import TableOrder from './components/tableOrder'
import TableTransaction from './components/tableTransaction'
import {
  filterWalletTransactions,
  createWalletTransaction,
} from '@/services/api/wallet/walletTransaction'
import {
  WalletTransactionDTO,
  WalletTransactionType,
} from '@/types/wallet/walletTransactionDTO'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { getListBank } from '@/services/api/listbank/listbank'
import { Bank } from '@/types/listbank/listbank'

type OrderRow = {
  id: string
  title: string
  income: number
  createdAt: string | Date
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED'
  source?: string
}

type TxStatus = 'PENDING' | 'COMPLETED' | 'FAILED'
type TxRow = {
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

function Page() {
  const { user } = useAuth()

  // Wallet + loading
  const [wallet, setWallet] = React.useState<WalletDTO | null>(null)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string | null>(null)

  // Tables data
  const [orders, setOrders] = React.useState<OrderRow[]>([])
  const [withdrawals, setWithdrawals] = React.useState<TxRow[]>([])
  const [deposits, setDeposits] = React.useState<TxRow[]>([])
  const [systems, setSystems] = React.useState<TxRow[]>([])

  // Filters + tabs
  const [activeTab, setActiveTab] = React.useState<
    'orders' | 'withdrawals' | 'deposits' | 'systems'
  >('orders')
  const [fromDate, setFromDate] = React.useState<string>('')
  const [toDate, setToDate] = React.useState<string>('')
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | 0 | 1 | 2 | 3>(
    'ALL'
  )
  const [reloadKey, setReloadKey] = React.useState(0)

  // Deposit/Withdraw modals
  const [withdrawOpen, setWithdrawOpen] = React.useState(false)
  const [depositOpen, setDepositOpen] = React.useState(false)
  const [txAmount, setTxAmount] = React.useState<string>('')
  const [submitting, setSubmitting] = React.useState(false)

  // Bank update modal
  const [bankOpen, setBankOpen] = React.useState(false)
  const [bankSubmitting, setBankSubmitting] = React.useState(false)
  const [bankList, setBankList] = React.useState<Bank[]>([])
  const [bankName, setBankName] = React.useState<string>('')
  const [bankAccountNumber, setBankAccountNumber] = React.useState<string>('')

  const formatVND = (n?: number) =>
    typeof n === 'number'
      ? new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(n)
      : '—'

  // Map status (backend: 0=Success,1=Failed,2=Pending,3=Canceled)
  const mapStatusTx = (s: number | string): TxStatus | 'CANCELLED' => {
    if (typeof s === 'number') {
      if (s === 0) return 'COMPLETED'
      if (s === 2) return 'PENDING'
      if (s === 3) return 'CANCELLED'
      return 'FAILED'
    }
    if (s === 'Success') return 'COMPLETED'
    if (s === 'Pending') return 'PENDING'
    if (s === 'Canceled') return 'CANCELLED'
    return 'FAILED'
  }

  // Load wallet + list theo tab
  React.useEffect(() => {
    const run = async () => {
      if (!user?.shopId) {
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        // Wallet
        const resWallet = await getWalletShopId(user.shopId)
        const walletData: WalletDTO | null =
          resWallet && (resWallet as WalletDTO).id
            ? (resWallet as WalletDTO)
            : resWallet && (resWallet as { data?: WalletDTO }).data
            ? (resWallet as { data?: WalletDTO }).data ?? null
            : null
        setWallet(walletData)

        // Type theo tab
        const typeToFetch: number =
          activeTab === 'orders'
            ? 2
            : activeTab === 'withdrawals'
            ? 0
            : activeTab === 'deposits'
            ? 1
            : 3

        const list = await filterWalletTransactions({
          ShopId: user.shopId,
          Types: [typeToFetch],
          Status: statusFilter === 'ALL' ? undefined : statusFilter,
          FromTime: fromDate ? new Date(fromDate).toISOString() : undefined,
          ToTime: toDate ? new Date(toDate).toISOString() : undefined,
          PageIndex: 1,
          PageSize: 50,
        })

        const items: WalletTransactionDTO[] = list.items ?? []

        if (activeTab === 'orders') {
          setOrders(
            items.map((it) => ({
              id: it.orderId || it.id,
              title:
                it.description ||
                `Đơn hàng #${(it.orderId || it.id).slice(0, 8)}`,
              income: it.amount,
              createdAt: it.createdAt,
              status:
                mapStatusTx(it.status) === 'COMPLETED'
                  ? 'COMPLETED'
                  : mapStatusTx(it.status) === 'PENDING'
                  ? 'PENDING'
                  : 'CANCELLED',
              source: 'Từ đơn hàng',
            }))
          )
        } else {
          const toTxRow = (it: WalletTransactionDTO): TxRow => ({
            id: it.id,
            bankName: it.bankAccount ?? '',
            bankAccountNumber: it.bankNumber ?? '',
            bankAccountName: it.bankAccount ?? '',
            amount: it.amount,
            status: mapStatusTx(it.status) as TxStatus,
            createdAt: it.createdAt,
            processedAt: it.lastModifiedAt ?? null,
            transactionId: it.transactionId ?? null,
            description: it.description ?? null,
          })

          if (activeTab === 'withdrawals') setWithdrawals(items.map(toTxRow))
          if (activeTab === 'deposits') setDeposits(items.map(toTxRow))
          if (activeTab === 'systems') setSystems(items.map(toTxRow))
        }
      } catch {
        setError('Không thể tải thông tin ví')
        setWallet(null)
        setOrders([])
        setWithdrawals([])
        setDeposits([])
        setSystems([])
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [user?.shopId, activeTab, fromDate, toDate, statusFilter, reloadKey])

  // Load danh sách ngân hàng khi mở modal
  React.useEffect(() => {
    const loadBanks = async () => {
      if (!bankOpen) return
      try {
        const banks = await getListBank()
        const sorted = [...banks].sort((a, b) => a.name.localeCompare(b.name))
        setBankList(sorted)
      } catch {
        toast.error('Không tải được danh sách ngân hàng')
      }
    }
    loadBanks()
  }, [bankOpen])

  return (
    <div className="flex flex-col gap-5 min-h-full">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
        <h2 className="text-xl font-bold">Quản lý giao dịch</h2>
      </div>

      <div className="mx-5 mb-10">
        <Card className="bg-white py-5 px-8 min-h-[75vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wallet summary */}
            <Card className="bg-gradient-to-br p-0 from-blue-50 to-white shadow-none rounded-lg border">
              <CardContent className="flex items-center gap-5 p-6">
                <div className="p-3 bg-blue-100 rounded-full shrink-0">
                  <Wallet className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-blue-700">Ví của tôi</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-green-600 hover:bg-green-700 cursor-pointer"
                        onClick={() => {
                          setTxAmount('')
                          setDepositOpen(true)
                        }}
                      >
                        Nạp tiền
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                        onClick={() => {
                          setTxAmount('')
                          setWithdrawOpen(true)
                        }}
                      >
                        Yêu cầu rút
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    {loading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-56" />
                        <Skeleton className="h-5 w-40" />
                      </div>
                    ) : error ? (
                      <p className="text-red-600">{error}</p>
                    ) : (
                      <p className="font-medium text-blue-800">
                        Số dư: {formatVND(wallet?.balance)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bank account */}
            <Card className="bg-gradient-to-br from-green-50 p-0 to-white shadow-none rounded-lg border">
              <CardContent className="flex items-center gap-5 p-6">
                <div className="p-3 bg-green-100 rounded-full shrink-0">
                  <Banknote className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-green-700">
                      Tài khoản: {wallet?.bankName || 'Chưa cập nhật'}
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-green-600 hover:bg-green-700 cursor-pointer"
                      onClick={() => {
                        setBankAccountNumber(wallet?.bankAccountNumber ?? '')
                        setBankName(wallet?.bankName ?? '')
                        setBankOpen(true)
                      }}
                    >
                      Cập nhật
                    </Button>
                  </div>
                  <div className="mt-2">
                    {loading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-56" />
                        <Skeleton className="h-5 w-40" />
                      </div>
                    ) : error ? (
                      <p className="text-red-600">{error}</p>
                    ) : (
                      <p className="font-medium text-green-800">
                        Số tài khoản:{' '}
                        {wallet?.bankAccountNumber || 'Chưa cập nhật'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="mt-5">
            <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="grid grid-cols-2 gap-2 md:col-span-2">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  aria-label="Từ ngày"
                  className="h-10 border rounded px-3"
                />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  aria-label="Đến ngày"
                  className="h-10 border rounded px-3"
                />
              </div>
              <div>
                <select
                  className="w-full h-10 border rounded px-3"
                  value={
                    typeof statusFilter === 'string'
                      ? 'ALL'
                      : String(statusFilter)
                  }
                  onChange={(e) => {
                    const v = e.target.value
                    if (v === 'ALL') setStatusFilter('ALL')
                    else {
                      const n = Number(v)
                      if (n === 0 || n === 1 || n === 2 || n === 3)
                        setStatusFilter(n)
                    }
                  }}
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value={0}>Hoàn thành</option>
                  <option value={2}>Chờ xử lý</option>
                  <option value={1}>Thất bại</option>
                  <option value={3}>Đã hủy</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFromDate('')
                    setToDate('')
                    setStatusFilter('ALL')
                  }}
                >
                  Đặt lại
                </Button>
                <Button
                  onClick={() => {
                    /* state changes already trigger effect */
                  }}
                  disabled={loading}
                >
                  Áp dụng
                </Button>
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as typeof activeTab)}
            >
              <TabsList className="rounded-none bg-gray-200 border">
                <TabsTrigger
                  value="orders"
                  className="rounded-none p-4 data-[state=active]:bg-[#B0F847]/50 data-[state=active]:text-black"
                >
                  Thu nhập đơn hàng
                </TabsTrigger>
                <TabsTrigger
                  value="withdrawals"
                  className="rounded-none p-4 data-[state=active]:bg-[#B0F847]/50 data-[state=active]:text-black"
                >
                  Yêu cầu rút tiền
                </TabsTrigger>
                <TabsTrigger
                  value="deposits"
                  className="rounded-none p-4 data-[state=active]:bg-[#B0F847]/50 data-[state=active]:text-black"
                >
                  Nạp tiền vào ví
                </TabsTrigger>
                <TabsTrigger
                  value="systems"
                  className="rounded-none p-4 data-[state=active]:bg-[#B0F847]/50 data-[state=active]:text-black"
                >
                  Thanh toán hệ thống
                </TabsTrigger>
              </TabsList>

              <div className="mt-4" />

              <TabsContent value="orders">
                <TableOrder rows={orders} />
              </TabsContent>
              <TabsContent value="withdrawals">
                <TableTransaction
                  rows={withdrawals}
                  typeLabel="Yêu cầu rút tiền"
                  accountHeaderLabel="Tài khoản nhận"
                  amountPositive={false}
                />
              </TabsContent>
              <TabsContent value="deposits">
                <TableTransaction
                  rows={deposits}
                  typeLabel="Nạp tiền vào ví"
                  accountHeaderLabel="Tài khoản nạp"
                  amountPositive={true}
                />
              </TabsContent>
              <TabsContent value="systems">
                <TableTransaction
                  rows={systems}
                  typeLabel="Thanh toán hệ thống"
                  accountHeaderLabel="Tài khoản nạp"
                  amountPositive={false}
                  showDetails={true}
                  hideTransactionId={true}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Withdraw modal */}
          <AlertDialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Yêu cầu rút tiền</AlertDialogTitle>
                <AlertDialogDescription>
                  Nhập số tiền muốn rút. Tối thiểu 51.000đ
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div>
                <Input
                  type="number"
                  min={0}
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  placeholder="Nhập số tiền (VND)"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={submitting}>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={submitting}
                  onClick={async () => {
                    const value = Number(txAmount)
                    if (!Number.isFinite(value) || value <= 0) {
                      toast.error('Số tiền phải lớn hơn 0')
                      return
                    }
                    if (value < 51000) {
                      toast.error('Số tiền rút tối thiểu là 51.000đ')
                      return
                    }
                    if (!user?.shopId) {
                      toast.error('Thiếu ShopId')
                      return
                    }
                    try {
                      setSubmitting(true)
                      await createWalletTransaction({
                        type: WalletTransactionType.Withdraw,
                        amount: value,
                      })
                      toast.success('Tạo yêu cầu rút tiền thành công')
                      const res = await getWalletShopId(user.shopId)
                      const data: WalletDTO | null =
                        res && (res as WalletDTO).id
                          ? (res as WalletDTO)
                          : res && (res as { data?: WalletDTO }).data
                          ? (res as { data?: WalletDTO }).data ?? null
                          : null
                      setWallet(data)
                      setWithdrawOpen(false)
                      setTxAmount('')
                      setReloadKey((k) => k + 1)
                    } catch {
                      toast.error('Tạo yêu cầu rút tiền thất bại')
                    } finally {
                      setSubmitting(false)
                    }
                  }}
                >
                  Xác nhận
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Deposit modal */}
          <AlertDialog open={depositOpen} onOpenChange={setDepositOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Nạp tiền vào ví</AlertDialogTitle>
                <AlertDialogDescription>
                  Nhập số tiền muốn nạp. Số tiền phải lớn hơn 0.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div>
                <Input
                  type="number"
                  min={0}
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  placeholder="Nhập số tiền (VND)"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={submitting}>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={submitting}
                  onClick={async () => {
                    const value = Number(txAmount)
                    if (!Number.isFinite(value) || value <= 0) {
                      toast.error('Số tiền phải lớn hơn 0')
                      return
                    }
                    if (!user?.shopId) {
                      toast.error('Thiếu ShopId')
                      return
                    }
                    try {
                      setSubmitting(true)
                      await createWalletTransaction({
                        type: WalletTransactionType.Deposit,
                        amount: value,
                      })
                      toast.success('Nạp tiền thành công')
                      const res = await getWalletShopId(user.shopId)
                      const data: WalletDTO | null =
                        res && (res as WalletDTO).id
                          ? (res as WalletDTO)
                          : res && (res as { data?: WalletDTO }).data
                          ? (res as { data?: WalletDTO }).data ?? null
                          : null
                      setWallet(data)
                      setDepositOpen(false)
                      setTxAmount('')
                      setReloadKey((k) => k + 1)
                    } catch {
                      toast.error('Nạp tiền thất bại')
                    } finally {
                      setSubmitting(false)
                    }
                  }}
                >
                  Xác nhận
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Bank update modal */}
          <AlertDialog open={bankOpen} onOpenChange={setBankOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Cập nhật thông tin ngân hàng
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Vui lòng chọn ngân hàng và nhập số tài khoản. Tất cả trường là
                  bắt buộc.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tên ngân hàng
                  </label>
                  <select
                    className="w-full h-10 border rounded px-3"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  >
                    <option value="" disabled>
                      — Chọn ngân hàng —
                    </option>
                    {bankList.map((b) => (
                      <option key={b.id} value={b.shortName}>
                        {b.shortName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Số tài khoản
                  </label>
                  <Input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="Nhập số tài khoản"
                  />
                </div>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel disabled={bankSubmitting}>
                  Hủy
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={
                    bankSubmitting ||
                    bankName.trim().length === 0 ||
                    bankAccountNumber.trim().length === 0
                  }
                  onClick={async () => {
                    if (bankName.trim().length === 0) {
                      toast.error('Vui lòng chọn ngân hàng')
                      return
                    }
                    if (bankAccountNumber.trim().length === 0) {
                      toast.error('Vui lòng nhập số tài khoản')
                      return
                    }
                    if (!user?.shopId) {
                      toast.error('Thiếu ShopId')
                      return
                    }
                    try {
                      setBankSubmitting(true)
                      const updated = await updateShopWalletBankingInfo(
                        user.shopId,
                        {
                          bankName,
                          bankAccountNumber,
                        }
                      )
                      setWallet(updated)
                      toast.success('Cập nhật ngân hàng thành công')
                      setBankOpen(false)
                    } catch {
                      toast.error('Cập nhật ngân hàng thất bại')
                    } finally {
                      setBankSubmitting(false)
                    }
                  }}
                >
                  Cập nhật
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Card>
      </div>
    </div>
  )
}

export default Page
