import React from "react";

import ReviewOrders from "./components/ReviewOrders";
import Statistical from "./components/Statistical";
import BestSelling from "./components/BestSelling";
import LivestreamStatistics from "./components/LivestreamStatistics";
import OrderClassificationChart from "./components/OrderClassificationChart";

function page() {
  return (
    <div className="flex flex-col gap-5 min-h-full">
      <div className="bg-white h-fit w-full py-4 px-8 shadow">
        <h2 className="text-lg font-bold ">Thống kê & phân tích</h2>
        <h2 className="text-black/70">
          Tổng quan và hiệu suất doanh thu bán hàng
        </h2>
      </div>
      <div className="flex flex-col gap-5 mx-5 mb-10">
        <Statistical />
        <ReviewOrders />
        <div className="grid grid-cols-3 gap-6 h-[500px]">
          {/* Grid 3 cột bằng nhau hoàn toàn */}
          
          {/* Cột 1: Thống kê Livestream */}
          <div className="col-span-1">
            <LivestreamStatistics />
          </div>
          
          {/* Cột 2: Phân loại đơn hàng */}
          <div className="col-span-1">
            <OrderClassificationChart />
          </div>

          {/* Cột 3: Sản phẩm bán chạy */}
          <div className="col-span-1">
            <BestSelling />
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;
