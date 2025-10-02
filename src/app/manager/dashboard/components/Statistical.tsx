'use client'

import { CircleDollarSign, Eye, ShoppingCart, UserRound } from 'lucide-react'
import React from 'react'
import { getSystemOrderStatistics } from '@/services/api/statistics/statistics'
// Đổi path cho đúng dự án của bạn
import {
  getAllUsersForAdmin,
  getCurrentUser,
} from '@/services/api/auth/account'
import { getAllShops } from '@/services/api/shop/shop'
import { FilterShop } from '@/types/shop/shop'

function Statistical() {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // State cho các thống kê
  const [totalRevenue, setTotalRevenue] = React.useState<number>(0)
  const [totalUsers, setTotalUsers] = React.useState<number>(0)
  const [totalLivestreams, setTotalLivestreams] = React.useState<number>(0) // tạm dùng tổng shop
  const [totalOrders, setTotalOrders] = React.useState<number>(0)

  // Helper: lấy tổng count từ nhiều cấu trúc payload khác nhau
  const extractTotalCount = (payload: unknown): number => {
    const isObj = (v: unknown): v is Record<string, unknown> =>
      typeof v === 'object' && v !== null

    const get = (obj: unknown, path: string[]): unknown => {
      let cur: unknown = obj
      for (const key of path) {
        if (!isObj(cur)) return undefined
        cur = cur[key]
      }
      return cur
    }

    const asNum = (v: unknown): number | undefined =>
      typeof v === 'number' && Number.isFinite(v) ? v : undefined

    const arrLen = (v: unknown): number | undefined =>
      Array.isArray(v) ? v.length : undefined

    // nếu response bọc trong { data: ... } thì lấy ra
    const d =
      isObj(payload) && 'data' in payload
        ? (payload as Record<string, unknown>).data
        : payload

    return (
      asNum(get(d, ['totalCount'])) ??
      asNum(get(d, ['data', 'totalCount'])) ??
      asNum(get(d, ['paging', 'total'])) ??
      arrLen(get(d, ['items'])) ??
      arrLen(get(d, ['data', 'items'])) ??
      arrLen(d) ??
      0
    )
  }

  React.useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true)
      setError(null)
      try {
        // 30 ngày gần nhất
        const to = new Date()
        const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000)
        const EMPTY_FILTER_SHOP: FilterShop = {
          pageNumber: 1,
          pageSize: 1000,
          ascending: true,
        }
        const [sysRes, usersArr, shopsRes] = await Promise.all([
          getSystemOrderStatistics({ fromDate: from, toDate: to }),
          getCurrentUser(), // trả về mảng users
          getAllShops(EMPTY_FILTER_SHOP),
        ])
        console.log('user', usersArr)
        // Chuẩn hóa DTO thống kê hệ thống
        const sys = sysRes.data ?? sysRes
        setTotalRevenue(Number(sys?.totalRevenue ?? 0))
        setTotalOrders(Number(sys?.totalOrders ?? 0))

        // Tổng người dùng (đã gộp role 1,2,3,5)
        setTotalUsers(Array.isArray(usersArr) ? usersArr.length - 1 : 0)
        console.log(shopsRes)
        // TẠM: tổng số buổi livestream = tổng shop (nếu có endpoint livestreams hệ thống, thay tại đây)
        setTotalLivestreams(extractTotalCount(shopsRes))
      } catch (err) {
        console.error('Error fetching statistics:', err)
        setError('Không thể tải thống kê')
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [])

  const renderValue = (val: number, suffix?: string) =>
    loading ? '...' : `${val.toLocaleString()}${suffix ?? ''}`

  return (
    <div className="rounded-sm">
      <div className="grid grid-cols-4 gap-6">
        {/* Tổng doanh thu */}
        <div className="bg-white rounded-lg border-t-yellow-500 border-t-4 shadow p-5 min-w-[220px]">
          <div className="text-gray-500 text-sm font-semibold mb-1">
            Tổng doanh thu
          </div>
          <div className="flex items-center justify-between">
            <div className="flex">
              <span className="text-3xl font-bold text-black">
                {renderValue(totalRevenue)}
              </span>
              <span className="text-lg font-semibold text-black mb-0.5">đ</span>
            </div>
            <span className="bg-yellow-100 rounded-xl p-2">
              <CircleDollarSign className="text-yellow-500" size={28} />
            </span>
          </div>
          {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
        </div>

        {/* Tổng số người dùng */}
        <div className="bg-white rounded-lg p-5 min-w-[220px] border-t-blue-500 border-t-4 shadow">
          <div className="text-gray-500 text-sm font-semibold mb-1">
            Tổng số người dùng
          </div>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-black">
              {renderValue(totalUsers)}
            </span>
            <span className="bg-blue-100 rounded-xl p-2">
              <UserRound className="text-blue-500" size={28} />
            </span>
          </div>
        </div>

        {/* Số buổi livestream (tạm = tổng shop) */}
        <div className="bg-white rounded-lg p-5 min-w-[220px] border-t-purple-500 border-t-4 shadow">
          <div className="text-gray-500 text-sm font-semibold mb-1">
            Tổng số cửa hàng
          </div>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-black">
              {renderValue(totalLivestreams)}
            </span>
            <span className="bg-purple-100 rounded-xl p-2">
              <Eye className="text-purple-500" size={28} />
            </span>
          </div>
          {/* Khi có endpoint livestreams hệ thống:
              const lsCount = await getAllLivestreamsCount();
              setTotalLivestreams(lsCount);
          */}
        </div>

        {/* Tổng số đơn hàng */}
        <div className="bg-white rounded-lg p-5 min-w-[220px] border-t-orange-500 border-t-4 shadow">
          <div className="text-gray-500 text-sm font-semibold mb-1">
            Tổng số đơn hàng
          </div>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-black">
              {renderValue(totalOrders)}
            </span>
            <span className="bg-orange-100 rounded-xl p-2">
              <ShoppingCart className="text-orange-500" size={28} />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Statistical
