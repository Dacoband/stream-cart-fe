"use client";

import { CircleDollarSign, Eye, ShoppingCart, UserRound } from "lucide-react";
import React from "react";
import { useAuth } from '@/lib/AuthContext';
import { getOrdersStatisticsByShop } from '@/services/api/order/order';
import { getLivestreamStatisticsByShop } from '@/services/api/livestream/livestream';
import { getProductCountByShop } from '@/services/api/product/productShop';
import { getOrderCompletionRate } from '@/services/api/order/getOrders';

function Statistical() {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  interface OrdersStats {
    totalOrders?: number;
    totalRevenue?: number;
    completeOrderCount?: number;
    processingOrderCount?: number;
    canceledOrderCount?: number;
    refundOrderCount?: number;
    totalProducts?: number;
  }
  interface LivestreamStats {
    totalLivestreams?: number;
    totalDuration?: number;
    totalViewers?: number;
    averageDuration?: number;
    averageViewers?: number;
  }

  const [ordersStats, setOrdersStats] = React.useState<OrdersStats | null>(null);
  const [livestreamStats, setLivestreamStats] = React.useState<LivestreamStats | null>(null);
  const [productCount, setProductCount] = React.useState<number | null>(null);
  const [completionRate, setCompletionRate] = React.useState<number>(0);

  React.useEffect(() => {
    const fetch = async () => {
      if (!user?.shopId) return;
      setLoading(true);
      try {
        const [o, l, pCount, cRate] = await Promise.all([
          getOrdersStatisticsByShop(user.shopId),
          getLivestreamStatisticsByShop(user.shopId),
          getProductCountByShop(user.shopId, true),
          getOrderCompletionRate(user.shopId),
        ]);
        setOrdersStats(o);
        setLivestreamStats(l);
        setProductCount(pCount);
        setCompletionRate(cRate);
      } catch (err) {
        console.error('Error fetching statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [user?.shopId]);
  return (
    <div className=" rounded-sm">
      <div className="grid grid-cols-5 gap-6">
        <div className="bg-white rounded-lg border-t-yellow-500 border-t-4 shadow p-5 min-w-[220px]">
          <div className="text-gray-500 text-sm font-semibold mb-1">Tổng doanh thu</div>
          <div className="flex items-center justify-between">
            <div className="flex">
              <span className="text-3xl font-bold text-black">{loading ? '...' : (ordersStats?.totalRevenue ?? 0).toLocaleString()}</span>
              <span className="text-lg font-semibold text-black mb-0.5">đ</span>
            </div>
            <span className="bg-yellow-100 rounded-xl p-2">
              <CircleDollarSign className="text-yellow-500" size={28} />
            </span>
          </div>
          {/* <div className="flex items-center gap-2 mt-2">
            <span className="text-blue-500 font-semibold text-sm">{loading ? '' : '↗ +0.0%'}</span>
          </div> */}
        </div>

        <div className="bg-white rounded-lg p-5 min-w-[220px]  border-t-blue-500 border-t-4 shadow">
          <div className="text-gray-500 text-sm font-semibold mb-1">Tổng sản phẩm</div>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-black">{loading ? '...' : (productCount ?? 0)}</span>
            <span className="bg-blue-100 rounded-xl p-2">
              <ShoppingCart className="text-blue-500" size={28} />
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-blue-500 font-semibold text-sm">{loading ? '' : ''}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg  p-5 min-w-[220px]  border-t-orange-500 border-t-4  shadow">
          <div className="text-gray-500 text-sm font-semibold mb-1">Tổng đơn hàng</div>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-black">{loading ? '...' : (ordersStats?.totalOrders ?? 0)}</span>
            <span className="bg-orange-100 rounded-xl p-2">
              <UserRound className="text-orange-500" size={28} />
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-red-500 font-semibold text-sm">{loading ? '' : ''}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg  p-5 min-w-[220px]  border-t-purple-500 border-t-4  shadow">
          <div className="text-gray-500 text-sm font-semibold mb-1">Số lần Livestream</div>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-black">{loading ? '...' : (livestreamStats?.totalLivestreams ?? 0)}</span>
            <span className="bg-purple-100 rounded-xl p-2">
              <Eye className="text-purple-500" size={28} />
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-purple-500 font-semibold text-sm">{loading ? '' : ''}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border-t-yellow-500 border-t-4 shadow p-5 min-w-[220px]">
          <div className="text-gray-500 text-sm font-semibold mb-1">Tỉ lệ hoàn thành đơn</div>
          <div className="flex items-center justify-between">
            <div className="flex">
              <span className="text-3xl font-bold text-black">{loading ? '...' : `${completionRate}%`}</span>
            </div>
            <span className="bg-yellow-100 rounded-xl p-2">
              <CircleDollarSign className="text-yellow-500" size={28} />
            </span>
          </div>
          {/* <div className="flex items-center gap-2 mt-2">
            <span className="text-blue-500 font-semibold text-sm">{loading ? '' : 'Giao thành công + Hoàn thành'}</span>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default Statistical;
