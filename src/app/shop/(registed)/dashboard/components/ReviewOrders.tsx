import { Card } from "@/components/ui/card";
import { Clock, Package, Truck, XCircle } from "lucide-react";
import React from "react";

function ReviewOrders() {
  return (
    <Card className=" p-4 ">
      <h3 className="font-bold text-xl">Quản lý đơn hàng</h3>
      <div className="grid grid-cols-4 gap-6">
        <div className="flex flex-col items-center justify-center rounded-xl bg-lime-50 py-5 ">
          <div className="bg-lime-200 rounded-xl p-3 mb-2">
            <Clock className="text-lime-600" size={32} />
          </div>
          <h1 className="text-2xl font-semibold text-lime-600">10</h1>
          <div className="font-semibold mt-1">Đơn đợi duyệt</div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl bg-blue-50 py-5">
          <div className="bg-blue-200 rounded-xl p-3 mb-2">
            <Package className="text-blue-600" size={32} />
          </div>
          <h1 className="text-2xl font-semibold text-blue-600">10</h1>
          <div className="font-semibold mt-1">Chờ lấy hàng</div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl bg-orange-50 py-5">
          <div className="bg-orange-200 rounded-xl p-3 mb-2">
            <Truck className="text-orange-600" size={32} />
          </div>
          <h1 className="text-2xl font-semibold text-orange-600">10</h1>
          <div className="font-semibold mt-1">Đang giao hàng</div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl bg-rose-50 py-5">
          <div className="bg-rose-200 rounded-xl p-3 mb-2">
            <XCircle className="text-rose-600" size={32} />
          </div>
          <h1 className="text-2xl font-semibold text-rose-600">10</h1>
          <div className="font-semibold mt-1">Hoàn trả/Hủy</div>
        </div>
      </div>
    </Card>
  );
}

export default ReviewOrders;
