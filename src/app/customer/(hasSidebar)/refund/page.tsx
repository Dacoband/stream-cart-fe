'use client'

import React, { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { RefundStatus } from '@/types/refund/refund'
import { ShopRefundList } from './components/RefundList'

type TabValue =
  | 'created'
  | 'confirmed'
  | 'processing'
  | 'completed'
  | 'refunded'
  | 'rejected'

const TABS: { label: string; value: TabValue }[] = [
  { label: 'Gửi yêu cầu', value: 'created' }, // 0
  { label: 'Đã xác nhận', value: 'confirmed' }, // 1
  { label: 'Đang xử lý', value: 'processing' }, // 2,3,4
  { label: 'Hoàn hàng thành công', value: 'completed' }, // 5
  { label: 'Hoàn tiền thành công', value: 'refunded' }, // 6
  { label: 'Bị từ chối', value: 'rejected' }, // 7
]

function getStatusesForTab(tab: TabValue): RefundStatus[] {
  switch (tab) {
    case 'created':
      return [RefundStatus.Created] // 0
    case 'confirmed':
      return [RefundStatus.Confirmed] // 1
    case 'processing':
      return [
        RefundStatus.Packed,
        RefundStatus.OnDelivery,
        RefundStatus.Delivered,
      ] // 2,3,4
    case 'completed':
      return [RefundStatus.Completed] // 5
    case 'refunded':
      return [RefundStatus.Refunded] // 6
    case 'rejected':
      return [RefundStatus.Rejected] // 7
  }
}

export default function ManageShopRefundsPage() {
  const [tab, setTab] = useState<TabValue>('created')

  return (
    <div className="container mx-auto px-4 py-6 h-[calc(100vh-9rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Quản lý yêu cầu hoàn hàng
        </h1>
        <p className="text-gray-600 mt-1">
          Theo dõi và xử lý yêu cầu hoàn hàng
        </p>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as TabValue)}
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid grid-cols-6 w-full rounded-none h-fit border-b bg-white p-0 overflow-hidden shadow-none">
          {TABS.map(({ label, value }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="relative text-base py-3 px-3 rounded-none font-normal
                         data-[state=active]:bg-[#B0F847]/40 data-[state=active]:text-[#65a406]
                         cursor-pointer hover:text-lime-600 flex items-center justify-center gap-1"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 overflow-y-auto mt-4">
          {TABS.map(({ value }) => (
            <TabsContent key={value} value={value} className="m-0">
              <ShopRefundList
                statuses={getStatusesForTab(value)}
                detailPathPrefix="/manager/refund"
              />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  )
}
