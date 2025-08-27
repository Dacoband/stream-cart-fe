'use client'

import { Card, CardContent, CardTitle } from '@/components/ui/card'
import React from 'react'
import { Wallet, Banknote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/AuthContext'
import { getWalletShopId } from '@/services/api/wallet/wallet'
import { WalletDTO } from '@/types/wallet/wallet'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import TableOrder from './components/tableOrder'
import TableTransaction from './components/tableTransaction'
import { filterWalletTransactions } from '@/services/api/wallet/walletTransaction'
import {
  WalletTransactionDTO,
  WalletTransactionStatus,
  WalletTransactionType,
} from '@/types/wallet/walletTransactionDTO'
function Page() {
  const { user } = useAuth()
  const [wallet, setWallet] = React.useState<WalletDTO | null>(null)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string | null>(null)
  const [orders, setOrders] = React.useState<
    {
      id: string
      title: string
      income: number
      createdAt: string | Date
      status: 'COMPLETED' | 'PENDING' | 'CANCELLED'
      source?: string
    }[]
  >([])
  const [withdrawals, setWithdrawals] = React.useState<
    {
      id: string
      bankName?: string
      bankAccountNumber?: string
      bankAccountName?: string
      amount: number
      fee?: number
      netAmount?: number
      status: 'PENDING' | 'COMPLETED' | 'FAILED'
      createdAt: string | Date
      processedAt?: string | Date | null
      transactionId?: string | null
    }[]
  >([])
  const [deposits, setDeposits] = React.useState<typeof withdrawals>([])
  const [systems, setSystems] = React.useState<typeof withdrawals>([])
  const [activeTab, setActiveTab] = React.useState<
    'orders' | 'withdrawals' | 'deposits' | 'systems'
  >('orders')

  const formatVND = (n?: number) =>
    typeof n === 'number'
      ? new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(n)
      : '—'

  React.useEffect(() => {
    const run = async () => {
      if (!user?.shopId) {
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const res = await getWalletShopId(user.shopId)
        const data: WalletDTO | null = res && res.id ? res : res?.data ?? null
        setWallet(data ?? null)
        // fetch transactions only for the current tab/type
        // Backend returns numeric enums starting from 0
        // Assume order: 0 Withdraw, 1 Deposit, 2 Commission, 3 System
        const typeToFetch: number =
          activeTab === 'orders'
            ? 2
            : activeTab === 'withdrawals'
            ? 0
            : activeTab === 'deposits'
            ? 1
            : 3

        const resList = await filterWalletTransactions({
          ShopId: user.shopId,
          Types: [typeToFetch],
          PageIndex: 1,
          PageSize: 50,
        })

        type ListShape =
          | { items?: WalletTransactionDTO[] }
          | { data?: { items?: WalletTransactionDTO[] } }
          | null
          | undefined
        const extractItems = (res: ListShape): WalletTransactionDTO[] => {
          if (!res) return []
          if ('items' in res && Array.isArray(res.items)) return res.items
          if ('data' in res && res?.data && Array.isArray(res.data.items))
            return res.data.items
          return []
        }
        const itemsSelected: WalletTransactionDTO[] = extractItems(
          resList as ListShape
        )

        const mapStatusTx = (
          s: number | string
        ): 'PENDING' | 'COMPLETED' | 'FAILED' => {
          // numeric enums: 0=Success,1=Failed,2=Pending,3=Canceled
          if (typeof s === 'number') {
            if (s === 0) return 'COMPLETED'
            if (s === 2) return 'PENDING'
            return 'FAILED'
          }
          const normalized = s.toString()
          if (normalized === 'Success') return 'COMPLETED'
          if (normalized === 'Pending') return 'PENDING'
          return 'FAILED'
        }

        if (activeTab === 'orders') {
          setOrders(
            itemsSelected.map((it) => ({
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
        }

        const mapTxRow = (it: WalletTransactionDTO) => {
          const anyIt = it as unknown as Record<string, unknown>
          const txId = (anyIt['transactionId'] ||
            anyIt['TransactionId'] ||
            anyIt['transactionID']) as string | undefined
          return {
            id: it.id,
            bankName: it.bankAccount || '',
            bankAccountNumber: it.bankNumber || '',
            bankAccountName: '',
            amount: it.amount,
            status: mapStatusTx(it.status),
            createdAt: it.createdAt,
            processedAt: it.lastModifiedAt ?? null,
            transactionId: txId ?? null,
            description: it.description ?? null,
          }
        }

        if (activeTab === 'withdrawals')
          setWithdrawals(itemsSelected.map(mapTxRow))
        if (activeTab === 'deposits') setDeposits(itemsSelected.map(mapTxRow))
        if (activeTab === 'systems') setSystems(itemsSelected.map(mapTxRow))
      } catch (e) {
        console.error(e)
        setError('Không thể tải thông tin ví')
        setWallet(null)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [user?.shopId, activeTab])

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
                {/* Icon */}
                <div className="p-3 bg-blue-100 rounded-full shrink-0">
                  <Wallet className="h-8 w-8 text-blue-600" />
                </div>
                {/* Nội dung */}
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-blue-700">Ví của tôi</CardTitle>
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    >
                      Yêu cầu rút
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
                {/* Icon */}
                <div className="p-3 bg-green-100 rounded-full shrink-0">
                  <Banknote className="h-8 w-8 text-green-600" />
                </div>
                {/* Nội dung */}
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-green-700">
                      Tài khoản: {wallet?.bankName || 'Chưa cập nhật'}
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-green-600 hover:bg-green-700 cursor-pointer"
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
          <div className="mt-5">
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
        </Card>
      </div>
    </div>
  )
}

export default Page
