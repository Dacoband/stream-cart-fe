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
const Badge = ({
  className = '',
  children,
}: {
  className?: string
  children: React.ReactNode
}) => (
  <span
    className={
      'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ' +
      className
    }
  >
    {children}
  </span>
)

const renderStatus = (status: RefundStatus) => {
  switch (status) {
    case RefundStatus.Created:
      return (
        <Badge className="bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200">
          Gửi yêu cầu
        </Badge>
      )
    case RefundStatus.Confirmed:
    case RefundStatus.Packed:
    case RefundStatus.OnDelivery:
    case RefundStatus.Delivered:
      return (
        <Badge className="bg-blue-100 text-blue-800 ring-1 ring-blue-200">
          Đang xử lý
        </Badge>
      )
    case RefundStatus.Completed:
      return (
        <Badge className="bg-green-100 text-green-800 ring-1 ring-green-200">
          Hoàn hàng thành công
        </Badge>
      )
    case RefundStatus.Refunded:
      return (
        <Badge className="bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200">
          Hoàn tiền thành công
        </Badge>
      )
    case RefundStatus.Rejected:
      return (
        <Badge className="bg-red-100 text-red-700 ring-1 ring-red-200">
          Bị từ chối
        </Badge>
      )
    default:
      return (
        <Badge className="bg-gray-100 text-gray-700 ring-1 ring-gray-200">
          Không xác định
        </Badge>
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
  // onRefundMoney,
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
              className="px-3 py-2 -mb-px border-b-2 border-transparent data-[state=active]:border-lime-600
                         data-[state=active]:text-lime-600 data-[state=active]:font-medium flex-none whitespace-nowrap
                         hover:text-lime-700"
            >
              {tab.label}
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>

        {/* Header */}
        <div
          className="grid grid-cols-[1.3fr_1.1fr_1.1fr_1.6fr_1.3fr_auto]
                     bg-[#B0F847] px-5 py-2 font-semibold text-gray-800 shadow-sm rounded-md"
        >
          <div>Mã đơn hàng</div>
          <div>Số tiền hoàn</div>
          <div>Trạng thái</div>
          <div>Được xử lý lúc</div>
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
              paged.map((refund, idx) => {
                const isCreated = refund.status === RefundStatus.Created // 0
                const canRefundMoney = refund.status === RefundStatus.Completed // 5

                const approving = !!approvingIds[refund.id]
                const rejecting = !!rejectingIds[refund.id]
                const refunding = !!refundingIds[refund.id]

                return (
                  <Card
                    key={refund.id}
                    className={`p-0 rounded-xl mb-4 border border-gray-100 transition
                               hover:shadow-sm ${
                                 idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'
                               }`}
                  >
                    <CardTitle className="bg-gradient-to-r from-gray-50 to-white rounded-t-xl border-b">
                      <div className="flex justify-between gap-3 px-5 py-2.5 text-xs sm:text-sm text-gray-500">
                        <span>
                          Mã yêu cầu:{' '}
                          <span className="font-medium text-gray-700">
                            {refund.id}
                          </span>
                        </span>
                        <span>
                          Ngày yêu cầu:{' '}
                          {formatFullDateTimeVN(refund.requestedAt)}
                        </span>
                      </div>
                    </CardTitle>

                    <CardContent
                      className="grid grid-cols-1 md:grid-cols-[1.3fr_1.1fr_1.1fr_1.6fr_1.3fr_auto]
                                 gap-3 px-5 py-4 items-center"
                    >
                      {/* orderCode (bold) */}
                      <div className="truncate">
                        <span className="font-semibold text-gray-900">
                          {refund.orderCode ?? '—'}
                        </span>
                      </div>

                      {/* refund amount */}
                      <div className="text-rose-600 font-semibold">
                        <PriceTag value={refund.refundAmount} />
                      </div>

                      {/* status */}
                      <div className="min-w-[140px]">
                        {renderStatus(refund.status)}
                      </div>

                      {/* processed by + time */}
                      <div className="text-sm text-gray-700">
                        {!refund.lastModifiedAt ? (
                          <span className="italic text-gray-500">
                            Chưa được xử lý
                          </span>
                        ) : (
                          <div className="flex flex-col leading-tight">
                            <span>
                              {formatFullDateTimeVN(refund.lastModifiedAt!)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* transaction id: chỉ khi Refunded (6) */}
                      <div className="text-xs md:text-sm text-gray-800 font-mono truncate">
                        {refund.status === RefundStatus.Refunded
                          ? refund.transactionId ?? '—'
                          : '—'}
                      </div>

                      {/* actions (dọc): hàng 1 = Chi tiết, hàng 2 = Từ chối + Phê duyệt, hàng 3 = Hoàn tiền */}
                      <div className="justify-self-end flex flex-col items-end gap-2 max-w-[280px]">
                        {/* Row 1: Chi tiết */}
                        <div className="w-full flex justify-end">
                          <Link href={`/manager/refund/${refund.id}`}>
                            <button
                              className="px-3 py-1.5 border rounded-lg text-sm shadow-sm hover:bg-blue-50
                                         text-blue-600 border-blue-200 flex items-center gap-1"
                            >
                              <PackageSearch size={16} /> Chi tiết
                            </button>
                          </Link>
                        </div>

                        {/* Row 2: Từ chối / Phê duyệt (nếu có) */}
                        {isCreated && (
                          <div className="w-full flex justify-end gap-2">
                            <button
                              disabled={rejecting || approving}
                              onClick={() => onReject?.(refund.id)}
                              className="px-3 py-1.5  border rounded-lg text-sm shadow-sm
                                         text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50"
                            >
                              {rejecting ? 'Đang từ chối…' : 'Từ chối'}
                            </button>
                            <button
                              disabled={approving || rejecting}
                              onClick={() => onApprove?.(refund.id)}
                              className="px-3 py-1.5 border rounded-lg text-sm shadow-sm
                                         text-green-600 border-green-200 hover:bg-green-50 disabled:opacity-50"
                            >
                              {approving ? 'Đang phê duyệt…' : 'Phê duyệt'}
                            </button>
                          </div>
                        )}

                        {/* Row 3: Hoàn tiền (nếu có) */}
                        {canRefundMoney && (
                          <div className="w-full flex justify-end">
                            <Link
                              href={`/manager/refund/payment?id=${refund.id}`}
                            >
                              <button
                                disabled={refunding}
                                className="px-3 py-1.5 border rounded-lg text-sm shadow-sm
                   text-emerald-700 border-emerald-200 hover:bg-emerald-50 disabled:opacity-50"
                              >
                                {refunding ? 'Đang hoàn tiền…' : 'Hoàn tiền'}
                              </button>
                            </Link>
                          </div>
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
              className="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
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
                    className={`px-3 py-1.5 rounded-md text-sm border transition
                      ${
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
              className="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
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
