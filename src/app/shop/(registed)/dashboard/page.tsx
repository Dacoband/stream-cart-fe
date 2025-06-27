import React from "react";
import ReviewOrders from "./components/ReviewOrders";
import Statistical from "./components/Statistical";
import { LineChartComponent } from "./components/LineChart";
import BestSelling from "./components/BestSelling";
function page() {
  return (
    <div className="flex flex-col gap-5 min-h-full">
      <div className="bg-white h-fit w-full py-4 px-8 shadow">
        <h2 className="text-xl font-bold ">Thống kê & phân tích</h2>
        <h2 className="text-black/70">
          Tổng quan và hiệu suất doanh thu bán hàng
        </h2>
      </div>
      <div className="flex flex-col gap-5 mx-5 mb-10">
        <Statistical />
        <ReviewOrders />
        <div className="flex gap-5">
          <div className="w-[65%] ">
            <LineChartComponent />
          </div>
          <div className="flex-1">
            <BestSelling />
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;
