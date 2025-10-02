import React from "react";
import Statistical from "./components/Statistical";
import RevenueChart from "./components/RevenueChart";
import ActiveLivestreams from "./components/ActiveLivestreams";
import UserRoleChart from "./components/UserRoleChart";
import BestSellingProducts from "./components/BestSellingProducts";

function page() {
  return (
    <div className="flex flex-col gap-5 min-h-full">
      <div className="bg-white h-fit w-full py-4 px-8 shadow">
        <h2 className="text-lg font-bold">Quản lý hệ thống</h2>
        <h2 className="text-black/70">
          Tổng quan và thống kê toàn hệ thống StreamCart
        </h2>
      </div>

      <div className="flex flex-col gap-5 mx-5 mb-10">
        {/* Thống kê tổng quan - 4 khối */}
        <Statistical />

        {/* Biểu đồ doanh thu 7 ngày */}
        <RevenueChart />

        {/* Grid 3 cột cho các thống kê chi tiết */}
        <div className="grid grid-cols-3 gap-6 h-[600px]">
          {/* Cột 1: Livestream đang hoạt động */}
          <div className="col-span-1 h-full">
            <ActiveLivestreams />
          </div>

          {/* Cột 2: Phân bố người dùng theo role */}
          <div className="col-span-1 h-full">
            <UserRoleChart />
          </div>

          {/* Cột 3: Sản phẩm bán chạy */}
          <div className="col-span-1 h-full">
            <BestSellingProducts />
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;
