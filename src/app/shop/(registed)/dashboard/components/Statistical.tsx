import { CircleDollarSign, Eye, ShoppingCart, UserRound } from "lucide-react";
import React from "react";

function Statistical() {
  return (
    <div className=" rounded-sm">
      <div className="grid grid-cols-5 gap-6">
        <div className="bg-white rounded-lg border-t-yellow-500 border-t-4 shadow p-5 min-w-[220px]">
          <div className="text-gray-500 text-sm font-semibold mb-1">
            Tổng doanh thu
          </div>
          <div className="flex items-center justify-between">
            <div className="flex">
              <span className="text-3xl font-bold text-black">132.000.000</span>
              <span className="text-lg font-semibold text-black mb-0.5">đ</span>
            </div>
            <span className="bg-yellow-100 rounded-xl p-2">
              <CircleDollarSign className="text-yellow-500" size={28} />
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-blue-500 font-semibold text-sm">↗ +8.2%</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-5 min-w-[220px]  border-t-blue-500 border-t-4 shadow">
          <div className="text-gray-500 text-sm font-semibold mb-1">
            Tổng sản phẩm
          </div>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-black">566</span>
            <span className="bg-blue-100 rounded-xl p-2">
              <ShoppingCart className="text-blue-500" size={28} />
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-blue-500 font-semibold text-sm">↗ +8.2%</span>
          </div>
        </div>

        <div className="bg-white rounded-lg  p-5 min-w-[220px]  border-t-orange-500 border-t-4  shadow">
          <div className="text-gray-500 text-sm font-semibold mb-1">
            Tổng đơn hàng
          </div>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-black">20</span>
            <span className="bg-orange-100 rounded-xl p-2">
              <UserRound className="text-orange-500" size={28} />
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-red-500 font-semibold text-sm">↘ -0.3%</span>
          </div>
        </div>
        <div className="bg-white rounded-lg  p-5 min-w-[220px]  border-t-purple-500 border-t-4  shadow">
          <div className="text-gray-500 text-sm font-semibold mb-1">
            Số lần Livestream{" "}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-black">15</span>
            <span className="bg-purple-100 rounded-xl p-2">
              <Eye className="text-purple-500" size={28} />
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-purple-500 font-semibold text-sm">
              ↗ +24.1%
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg border-t-yellow-500 border-t-4 shadow p-5 min-w-[220px]">
          <div className="text-gray-500 text-sm font-semibold mb-1">
            Tỉ lệ hoàn thành đơn
          </div>
          <div className="flex items-center justify-between">
            <div className="flex">
              <span className="text-3xl font-bold text-black">100%</span>
            </div>
            <span className="bg-yellow-100 rounded-xl p-2">
              <CircleDollarSign className="text-yellow-500" size={28} />
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-blue-500 font-semibold text-sm">↗ +8.2%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Statistical;
