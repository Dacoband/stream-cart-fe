'use client'

import React, { useMemo, useState } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { PackageSearch } from 'lucide-react'
import PriceTag from '@/components/common/PriceTag'
import { formatFullDateTimeVN } from '@/components/common/formatFullDateTimeVN'
import { RefundRequestDto, RefundStatus } from '@/types/refund/refund'

type EnrichedRefund = RefundRequestDto & {
  orderCode?: string
  processedByName?: string
}

const isEmptyGuid = (id?: string | null) =>
  !id || id === '00000000-0000-0000-0000-000000000000'

/* ============ UI helpers ============ */
const renderStatus = (status: RefundStatus) => {
  switch (status) {
    case RefundStatus.Created:
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
          Gửi yêu cầu
        </span>
      )
    case RefundStatus.Confirmed:
    case RefundStatus.Packed:
    case RefundStatus.OnDelivery:
    case RefundStatus.Delivered:
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
          Đang xử lý
        </span>
      )
    case RefundStatus.Completed:
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
          Hoàn hàng thành công
        </span>
      )
    case RefundStatus.Refunded:
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
          Hoàn tiền thành công
        </span>
      )
    case RefundStatus.Rejected:
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
          Bị từ chối
        </span>
      )
    default:
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
          Không xác định
        </span>
      )
  }
}

type TabValue = 'created' | 'processing' | 'completed' | 'refunded' | 'rejected'
const parseStatusesFromTab = (tab: TabValue): RefundStatus[] => {
  switch (tab) {
    case 'created':
      return [RefundStatus.Created] // 0
    case 'processing':
      return [
        RefundStatus.Confirmed,
        RefundStatus.Packed,
        RefundStatus.OnDelivery,
        RefundStatus.Delivered,
      ] // 1..4
    case 'completed':
      return [RefundStatus.Completed] // 5
    case 'refunded':
      return [RefundStatus.Refunded] // 6
    case 'rejected':
      return [RefundStatus.Rejected] // 7
  }
}

/* ============ Pagination helpers ============ */
const UI_PAGE_SIZE = 10
function buildPageList(
  current: number,
  total: number,
  delta = 1
): (number | '...')[] {
  const pages = new Set<number>([1, total])
  for (
    let i = Math.max(1, current - delta);
    i <= Math.min(total, current + delta);
    i++
  ) {
    pages.add(i)
  }
  const sorted = Array.from(pages).sort((a, b) => a - b)
  const out: (number | '...')[] = []
  let prev = 0
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push(p - prev === 2 ? prev + 1 : '...')
    out.push(p)
    prev = p
  }
  return out
}

/* ============ Component ============ */
type Props = {
  data: EnrichedRefund[]
  loading?: boolean
  error?: string | null
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  onRefundMoney?: (id: string) => void
  approvingIds?: Record<string, boolean>
  rejectingIds?: Record<string, boolean>
  refundingIds?: Record<string, boolean>
}

export const RefundRequestTable: React.FC<Props> = ({
  data,
  loading = false,
  error = null,
  onApprove,
  onReject,
  onRefundMoney,
  approvingIds = {},
  rejectingIds = {},
  refundingIds = {},
}) => {
  const [activeTab, setActiveTab] = useState<TabValue>('created')
  const [page, setPage] = useState(1)

  React.useEffect(() => setPage(1), [activeTab])

  // filter tab (client-side)
  const filtered = useMemo(() => {
    const allowed = new Set(parseStatusesFromTab(activeTab))
    return (data || []).filter((r) => allowed.has(r.status))
  }, [data, activeTab])

  // paginate
  const totalPages = Math.max(1, Math.ceil(filtered.length / UI_PAGE_SIZE))
  const start = (page - 1) * UI_PAGE_SIZE
  const end = start + UI_PAGE_SIZE
  const paged = filtered.slice(start, end)
  const pageList = buildPageList(page, totalPages, 1)

  return (
    <Card className="bg-white py-5 px-8 min-h-[75vh]">
      <TabsPrimitive.Root
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
      >
        {/* Tabs */}
        <TabsPrimitive.List className="flex gap-2 mb-4 border-b overflow-x-auto no-scrollbar -mx-8 px-8">
          {[
            { value: 'created', label: 'Gửi yêu cầu' },
            { value: 'processing', label: 'Đang xử lý' },
            { value: 'completed', label: 'Hoàn hàng thành công' },
            { value: 'refunded', label: 'Hoàn tiền thành công' },
            { value: 'rejected', label: 'Bị từ chối' },
          ].map((tab) => (
            <TabsPrimitive.Trigger
              key={tab.value}
              value={tab.value as TabValue}
              className="px-3 py-2 -mb-px border-b-2 border-transparent
                         data-[state=active]:border-lime-600
                         data-[state=active]:text-lime-600
                         data-[state=active]:font-medium
                         flex-none whitespace-nowrap"
            >
              {tab.label}
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>

        {/* Header */}
        <div className="grid grid-cols-[1.2fr_1.2fr_1.2fr_1.5fr_1.5fr_1fr] bg-[#B0F847] px-5 py-2 font-semibold text-gray-800 shadow-sm">
          <div>Mã đơn hàng</div>
          <div>Số tiền hoàn</div>
          <div>Trạng thái</div>
          <div>Được xử lý bởi</div>
          <div>Mã giao dịch</div>
          <div className="justify-self-end">Thao tác</div>
        </div>

        {/* Content */}
        <div className="max-h-[calc(75vh-180px)] overflow-y-auto">
          <TabsPrimitive.Content value={activeTab}>
            {loading ? (
              <Skeleton className="h-24 w-full" />
            ) : error ? (
              <div className="text-center py-8 text-red-600">{error}</div>
            ) : paged.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Không có yêu cầu hoàn hàng
              </div>
            ) : (
              paged.map((refund) => {
                const isCreated = refund.status === RefundStatus.Created // 0
                const canRefundMoney = refund.status === RefundStatus.Completed // 5

                const approving = !!approvingIds[refund.id]
                const rejecting = !!rejectingIds[refund.id]
                const refunding = !!refundingIds[refund.id]

                return (
                  <Card
                    key={refund.id}
                    className="p-0 rounded-none mb-5 shadow-none"
                  >
                    <CardTitle className="bg-gray-100">
                      <div className="flex justify-between px-5 py-2.5 text-sm text-gray-500">
                        <span>Mã yêu cầu: {refund.id}</span>
                        <span>
                          Ngày yêu cầu:{' '}
                          {formatFullDateTimeVN(refund.requestedAt)}
                        </span>
                      </div>
                    </CardTitle>

                    <CardContent className="grid grid-cols-[1.2fr_1.2fr_1.2fr_1.5fr_1.5fr_1fr] px-5 py-3 items-center">
                      {/* orderCode */}
                      <div className="truncate">{refund.orderCode ?? '—'}</div>

                      {/* refund amount */}
                      <div className="text-rose-600 font-medium">
                        <PriceTag value={refund.refundAmount} />
                      </div>

                      {/* status */}
                      <div>{renderStatus(refund.status)}</div>

                      {/* processed by + time */}
                      <div className="text-sm text-gray-700">
                        {isEmptyGuid(refund.processedByUserId) ||
                        !refund.processedAt ? (
                          <span>Chưa được xử lý</span>
                        ) : (
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {refund.processedByName ??
                                refund.processedByUserId}
                            </span>
                            <span className="text-gray-500">
                              {formatFullDateTimeVN(refund.processedAt!)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* transaction id: chỉ khi Refunded (6) */}
                      <div>
                        {refund.status === RefundStatus.Refunded
                          ? refund.transactionId ?? '—'
                          : '—'}
                      </div>

                      {/* actions */}
                      <div className="justify-self-end flex gap-2">
                        {/* Chi tiết */}
                        <Link href={`/refunds/${refund.id}`}>
                          <button className="text-blue-500 hover:underline flex items-center gap-1">
                            <PackageSearch size={16} /> Chi tiết
                          </button>
                        </Link>

                        {/* Created (0): Từ chối / Phê duyệt */}
                        {isCreated && (
                          <>
                            <button
                              disabled={rejecting || approving}
                              onClick={() => onReject?.(refund.id)}
                              className="px-3 py-1 border rounded-md text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              {rejecting ? 'Đang từ chối…' : 'Từ chối'}
                            </button>
                            <button
                              disabled={approving || rejecting}
                              onClick={() => onApprove?.(refund.id)}
                              className="px-3 py-1 border rounded-md text-sm text-green-600 hover:bg-green-50 disabled:opacity-50"
                            >
                              {approving ? 'Đang phê duyệt…' : 'Phê duyệt'}
                            </button>
                          </>
                        )}

                        {/* Completed (5): Hoàn tiền */}
                        {canRefundMoney && (
                          <button
                            disabled={refunding}
                            onClick={() => onRefundMoney?.(refund.id)}
                            className="px-3 py-1 border rounded-md text-sm text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                          >
                            {refunding ? 'Đang hoàn tiền…' : 'Hoàn tiền'}
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsPrimitive.Content>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            Tổng: {filtered.length} yêu cầu • {totalPages} trang
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Trước
            </button>

            <div className="flex items-center gap-1">
              {pageList.map((p, idx) =>
                p === '...' ? (
                  <span key={`dots-${idx}`} className="px-2 text-gray-500">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 rounded-md text-sm border ${
                      p === page
                        ? 'bg-lime-600 text-white border-lime-600'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            </div>

            <button
              className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Sau
            </button>
          </div>
        </div>
      </TabsPrimitive.Root>
    </Card>
  )
}
