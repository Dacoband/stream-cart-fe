"use client";

import { CircleDollarSign, Eye, ShoppingCart, UserRound } from "lucide-react";
import React from "react";

function Statistical() {
  const [loading, setLoading] = React.useState(true);

  // State cho các thống kê
  const [totalRevenue, setTotalRevenue] = React.useState<number>(0);
  const [totalUsers, setTotalUsers] = React.useState<number>(0);
  const [totalLivestreams, setTotalLivestreams] = React.useState<number>(0);
  const [totalOrders, setTotalOrders] = React.useState<number>(0);

  React.useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      try {
        setTimeout(() => {
          setTotalRevenue(452000);
          setTotalUsers(6);
          setTotalLivestreams(8);
          setTotalOrders(9);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error("Error fetching statistics:", err);
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

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
                {loading ? "..." : totalRevenue.toLocaleString()}
              </span>
              <span className="text-lg font-semibold text-black mb-0.5">đ</span>
            </div>
            <span className="bg-yellow-100 rounded-xl p-2">
              <CircleDollarSign className="text-yellow-500" size={28} />
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2"></div>
        </div>

        {/* Tổng số người dùng */}
        <div className="bg-white rounded-lg p-5 min-w-[220px] border-t-blue-500 border-t-4 shadow">
          <div className="text-gray-500 text-sm font-semibold mb-1">
            Tổng số người dùng
          </div>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-black">
              {loading ? "..." : totalUsers.toLocaleString()}
            </span>
            <span className="bg-blue-100 rounded-xl p-2">
              <UserRound className="text-blue-500" size={28} />
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2"></div>
        </div>

        {/* Số buổi livestream */}
        <div className="bg-white rounded-lg p-5 min-w-[220px] border-t-purple-500 border-t-4 shadow">
          <div className="text-gray-500 text-sm font-semibold mb-1">
            Số buổi livestream
          </div>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-black">
              {loading ? "..." : totalLivestreams}
            </span>
            <span className="bg-purple-100 rounded-xl p-2">
              <Eye className="text-purple-500" size={28} />
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2"></div>
        </div>

        {/* Tổng số đơn hàng */}
        <div className="bg-white rounded-lg p-5 min-w-[220px] border-t-orange-500 border-t-4 shadow">
          <div className="text-gray-500 text-sm font-semibold mb-1">
            Tổng số đơn hàng
          </div>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-black">
              {loading ? "..." : totalOrders.toLocaleString()}
            </span>
            <span className="bg-orange-100 rounded-xl p-2">
              <ShoppingCart className="text-orange-500" size={28} />
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2"></div>
        </div>
      </div>
    </div>
  );
}

export default Statistical;
