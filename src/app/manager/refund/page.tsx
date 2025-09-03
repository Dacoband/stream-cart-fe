'use client'

import React, { useEffect, useMemo, useState } from 'react'

import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// services
import {
  getShopRefunds,
  updateRefundStatus,
} from '@/services/api/refund/refund'
import { getOrderById } from '@/services/api/order/order'
import { getUserById } from '@/services/api/auth/account'

// types
import { RefundRequestDto, RefundStatus } from '@/types/refund/refund'
import { RefundRequestTable } from './components/RefundRequestTable'
import { Card } from '@/components/ui/card'

type EnrichedRefund = RefundRequestDto & {
  orderCode?: string
  processedByName?: string
}

const API_PAGE_SIZE = 200
const MAX_API_PAGES = 200

export default function RefundRequestsPage() {
  const [loading, setLoading] = useState(false)
  const [allRefunds, setAllRefunds] = useState<EnrichedRefund[]>([])
  const [error, setError] = useState<string | null>(null)

  // Date range filter (client-side)
  const [fromDate, setFromDate] = useState<string>('') // yyyy-MM-dd
  const [toDate, setToDate] = useState<string>('') // yyyy-MM-dd

  // Per-action loading maps
  const [approvingIds, setApprovingIds] = useState<Record<string, boolean>>({})
  const [rejectingIds, setRejectingIds] = useState<Record<string, boolean>>({})
  const [refundingIds, setRefundingIds] = useState<Record<string, boolean>>({})
  const router = useRouter()
  useEffect(() => {
    let cancelled = false

    const fetchAll = async () => {
      setLoading(true)
      setError(null)
      try {
        const aggregated: RefundRequestDto[] = []
        for (let pageNumber = 1; pageNumber <= MAX_API_PAGES; pageNumber++) {
          // lấy tất cả, không filter status - filter ở client
          const res = await getShopRefunds({
            pageNumber,
            pageSize: API_PAGE_SIZE,
          })
          const items = res?.items ?? []
          aggregated.push(...items)
          if (items.length < API_PAGE_SIZE) break
        }

        // Enrich: orderCode + processedByName
        const orderCodeCache = new Map<string, string>()
        const userNameCache = new Map<string, string>()

        const enriched: EnrichedRefund[] = []
        for (const r of aggregated) {
          // orderCode
          let orderCode: string | undefined = (r as any).orderCode
          if (!orderCode && r.orderId) {
            if (orderCodeCache.has(r.orderId)) {
              orderCode = orderCodeCache.get(r.orderId)!
            } else {
              try {
                const ord = await getOrderById(r.orderId)
                const code =
                  ord?.data?.data?.orderCode ??
                  ord?.data?.orderCode ??
                  ord?.orderCode
                if (code) {
                  orderCode = code
                  orderCodeCache.set(r.orderId, code)
                }
              } catch {
                // ignore
              }
            }
          }

          // processedByName
          let processedByName: string | undefined = undefined
          const emptyGuid = '00000000-0000-0000-0000-000000000000'
          if (r.lastModifiedBy && r.lastModifiedAt !== emptyGuid) {
            if (userNameCache.has(r.lastModifiedBy)) {
              processedByName = userNameCache.get(r.lastModifiedBy)!
            } else {
              try {
                const u = await getUserById(r.lastModifiedBy)
                const name =
                  u?.fullname ||
                  u?.fullName ||
                  u?.username ||
                  u?.email ||
                  r.lastModifiedBy
                processedByName = name
                userNameCache.set(r.lastModifiedBy, name)
              } catch {
                processedByName = r.lastModifiedBy
              }
            }
          }

          enriched.push({ ...r, orderCode, processedByName })
        }

        if (!cancelled) setAllRefunds(enriched)
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Lỗi tải dữ liệu hoàn hàng')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAll()
    return () => {
      cancelled = true
    }
  }, [])

  // Filter theo từ ngày — đến ngày (client)
  const filteredByDate = useMemo(() => {
    if (!fromDate && !toDate) return allRefunds
    const from = fromDate ? new Date(fromDate + 'T00:00:00') : null
    const to = toDate ? new Date(toDate + 'T23:59:59.999') : null
    return allRefunds.filter((r) => {
      const t = new Date(r.requestedAt)
      if (from && t < from) return false
      if (to && t > to) return false
      return true
    })
  }, [allRefunds, fromDate, toDate])

  // ===== Actions =====
  const handleApprove = async (refundId: string) => {
    try {
      setApprovingIds((m) => ({ ...m, [refundId]: true }))
      await updateRefundStatus({
        refundRequestId: refundId,
        newStatus: RefundStatus.Confirmed, // 1
      })
      toast.success('Đã phê duyệt yêu cầu hoàn hàng')
      setAllRefunds((prev) =>
        prev.map((r) =>
          r.id === refundId
            ? {
                ...r,
                status: RefundStatus.Confirmed,
                processedAt: new Date().toISOString(),
              }
            : r
        )
      )
    } catch (e: any) {
      toast.error(e?.message ?? 'Phê duyệt thất bại')
    } finally {
      setApprovingIds((m) => ({ ...m, [refundId]: false }))
    }
  }

  const handleReject = async (refundId: string) => {
    try {
      setRejectingIds((m) => ({ ...m, [refundId]: true }))
      await updateRefundStatus({
        refundRequestId: refundId,
        newStatus: RefundStatus.Rejected, // 7
      })
      toast.success('Đã từ chối yêu cầu hoàn hàng')
      setAllRefunds((prev) =>
        prev.map((r) =>
          r.id === refundId
            ? {
                ...r,
                status: RefundStatus.Rejected,
                processedAt: new Date().toISOString(),
              }
            : r
        )
      )
    } catch (e: any) {
      toast.error(e?.message ?? 'Từ chối thất bại')
    } finally {
      setRejectingIds((m) => ({ ...m, [refundId]: false }))
    }
  }

  const handleRefundMoney = async (refundId: string) => {
    try {
      setRefundingIds((m) => ({ ...m, [refundId]: true }))
      await updateRefundStatus({
        refundRequestId: refundId,
        newStatus: RefundStatus.Refunded, // 6
      })
      toast.success('Đã chuyển trạng thái Hoàn tiền thành công')
      setAllRefunds((prev) =>
        prev.map((r) =>
          r.id === refundId
            ? {
                ...r,
                status: RefundStatus.Refunded,
                processedAt: new Date().toISOString(),
              }
            : r
        )
      )
    } catch (e: any) {
      toast.error(e?.message ?? 'Cập nhật hoàn tiền thất bại')
    } finally {
      setRefundingIds((m) => ({ ...m, [refundId]: false }))
    }
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="bg-white my-5 px-8">
        <h1 className="text-xl font-semibold">Yêu cầu hoàn hàng</h1>

        {/* Date range filter */}
        <div className=" gap-3 flex  items-end flex-wrap">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Từ ngày</label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-48"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Đến ngày</label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-48"
            />
          </div>
        </div>
      </Card>

      <RefundRequestTable
        data={filteredByDate}
        loading={loading}
        error={error}
        onApprove={handleApprove}
        onReject={handleReject}
        onRefundMoney={handleRefundMoney}
        approvingIds={approvingIds}
        rejectingIds={rejectingIds}
        refundingIds={refundingIds}
      />
    </div>
  )
}
