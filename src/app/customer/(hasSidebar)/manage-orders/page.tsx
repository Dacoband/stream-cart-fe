'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { withRoleProtection } from '@/lib/requireRole'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { OrderList } from '@/app/customer/components/OrderList'
import { getStatusesForTab, OrderTabValue } from '@/types/order/orderStatus'
import { getCustomerOrders } from '@/services/api/order/customerOrder'
import LoadingScreen from '@/components/common/LoadingScreen'

const ORDER_TABS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chờ thanh toán', value: '0', count: 0 },
  { label: 'Chờ xác nhận', value: '1', count: 0 },
  { label: 'Chờ đóng gói', value: '2', count: 0 },
  // combined tab for 3 and 7
  { label: 'Chờ giao hàng', value: '3-7', count: 0 },
  // combined tab for 4 and 10
  { label: 'Thành công', value: '4-10', count: 0 },
  { label: 'Hủy đơn', value: '5', count: 0 },
  // returns/refunds combined 8,9 (optional)
  // { label: "Trả hàng/Hoàn tiền", value: "8-9", count: 0 },
]

function ManageOrders() {
  const { user, loading: authLoading } = useAuth()
  const [tab, setTab] = useState<OrderTabValue>('all')
  const [tabCounts, setTabCounts] = useState<Record<string, number>>({})
  const [loadingCounts, setLoadingCounts] = useState(true)
  const [openRefund, setOpenRefund] = useState(false)

  useEffect(() => {
    const fetchTabCounts = async () => {
      if (!user?.id) return

      setLoadingCounts(true)
      const counts: Record<string, number> = {}

      try {
        const allOrdersResponse = await getCustomerOrders({
          accountId: user.id,
          PageIndex: 1,
          PageSize: 1,
        })
        counts['all'] = allOrdersResponse.totalCount

        // Fetch counts for each specific status tab
        for (const orderTab of ORDER_TABS) {
          if (orderTab.value !== 'all') {
            const statuses = getStatusesForTab(orderTab.value as OrderTabValue)
            let totalCount = 0

            for (const status of statuses) {
              try {
                const response = await getCustomerOrders({
                  accountId: user.id,
                  PageIndex: 1,
                  PageSize: 1,
                  Status: status,
                })
                totalCount += response.totalCount
              } catch (error) {
                console.error(
                  `Error fetching count for status ${status}:`,
                  error
                )
              }
            }

            counts[orderTab.value] = totalCount
          }
        }

        setTabCounts(counts)
      } catch (error) {
        console.error('Error fetching tab counts:', error)
      } finally {
        setLoadingCounts(false)
      }
    }

    if (user?.id) {
      fetchTabCounts()
    }
  }, [user?.id])

  if (authLoading || !user) {
    return <LoadingScreen />
  }

  return (
    <div className="container mx-auto px-4 py-6 h-[calc(100vh-9rem)] overflow-y-auto ">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
        <p className="text-gray-600 mt-1">
          Theo dõi và quản lý các đơn hàng của bạn
        </p>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as OrderTabValue)}
        className="w-full rounded-none"
      >
        <TabsList className="grid grid-cols-7 w-full rounded-none h-fit border-b bg-white p-0 overflow-hidden shadow-none">
          {ORDER_TABS.map(({ label, value }) => {
            const count = loadingCounts ? 0 : tabCounts[value] || 0
            return (
              <TabsTrigger
                key={value}
                value={value}
                className={`
                  relative text-base py-3 px-3 rounded-none font-normal
                  data-[state=active]:bg-[#B0F847]/40 data-[state=active]:text-[#65a406] data-[state=active]:font-normal cursor-pointer hover:text-lime-600
                  flex items-center justify-center gap-1
                `}
              >
                {label}
                {count > 0 && !loadingCounts && <div>({count})</div>}
                {loadingCounts && (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin ml-1"></div>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {ORDER_TABS.map(({ value }) => (
          <TabsContent key={value} value={value} className="mt-4">
            <OrderList tabValue={value as OrderTabValue} accountId={user.id} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export default withRoleProtection(ManageOrders, [1])
