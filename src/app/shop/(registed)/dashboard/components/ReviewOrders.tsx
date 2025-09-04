"use client";

import { Card } from "@/components/ui/card";
import { Clock, Package, Truck, XCircle } from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { searchOrders } from "@/services/api/order/getOrders";

interface OrderStats {
  pending: number; // Đơn đợi duyệt (1,2)
  readyToShip: number; // Chờ lấy hàng (3)
  shipping: number; // Đang giao hàng (7)
  cancelled: number; // Hoàn trả/Hủy (5,8,9)
}

function ReviewOrders() {
  const { user } = useAuth();
  const [stats, setStats] = useState<OrderStats>({
    pending: 0,
    readyToShip: 0,
    shipping: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchOrderStats = useCallback(async () => {
    if (!user?.shopId) return;
    
    try {
      setLoading(true);
      
      // Đơn đợi duyệt (Status: 1,2)
      const [pendingOrders, processingOrders] = await Promise.all([
        searchOrders({ ShopId: user.shopId, OrderStatus: 1, PageSize: 1 }), // Chờ xác nhận
        searchOrders({ ShopId: user.shopId, OrderStatus: 2, PageSize: 1 }), // Chờ đóng gói
      ]);
      
      // Chờ lấy hàng (Status: 3)
      const readyToShipOrders = await searchOrders({ 
        ShopId: user.shopId, 
        OrderStatus: 3, 
        PageSize: 1 
      });
      
      // Đang giao hàng (Status: 7)
      const shippingOrders = await searchOrders({ 
        ShopId: user.shopId, 
        OrderStatus: 7, 
        PageSize: 1 
      });
      
      // Hoàn trả/Hủy (Status: 5,8,9)
      const [cancelledOrders, returningOrders, refundedOrders] = await Promise.all([
        searchOrders({ ShopId: user.shopId, OrderStatus: 5, PageSize: 1 }), // Đã hủy
        searchOrders({ ShopId: user.shopId, OrderStatus: 8, PageSize: 1 }), // Trả hàng
        searchOrders({ ShopId: user.shopId, OrderStatus: 9, PageSize: 1 }), // Đã hoàn tiền
      ]);

      setStats({
        pending: pendingOrders.totalCount + processingOrders.totalCount,
        readyToShip: readyToShipOrders.totalCount,
        shipping: shippingOrders.totalCount,
        cancelled: cancelledOrders.totalCount + returningOrders.totalCount + refundedOrders.totalCount,
      });
    } catch (error) {
      console.error("Error fetching order stats:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.shopId]);

  useEffect(() => {
    fetchOrderStats();
  }, [fetchOrderStats]);

  return (
    <Card className=" p-4 ">
      <h3 className="font-bold text-xl">Quản lý đơn hàng</h3>
      <div className="grid grid-cols-4 gap-6">
        <div className="flex flex-col items-center justify-center rounded-xl bg-lime-50 py-5 ">
          <div className="bg-lime-200 rounded-xl p-3 mb-2">
            <Clock className="text-lime-600" size={32} />
          </div>
          <h1 className="text-2xl font-semibold text-lime-600">
            {loading ? "..." : stats.pending}
          </h1>
          <div className="font-semibold mt-1">Đơn đợi duyệt</div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl bg-blue-50 py-5">
          <div className="bg-blue-200 rounded-xl p-3 mb-2">
            <Package className="text-blue-600" size={32} />
          </div>
          <h1 className="text-2xl font-semibold text-blue-600">
            {loading ? "..." : stats.readyToShip}
          </h1>
          <div className="font-semibold mt-1">Chờ lấy hàng</div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl bg-orange-50 py-5">
          <div className="bg-orange-200 rounded-xl p-3 mb-2">
            <Truck className="text-orange-600" size={32} />
          </div>
          <h1 className="text-2xl font-semibold text-orange-600">
            {loading ? "..." : stats.shipping}
          </h1>
          <div className="font-semibold mt-1">Đang giao hàng</div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl bg-rose-50 py-5">
          <div className="bg-rose-200 rounded-xl p-3 mb-2">
            <XCircle className="text-rose-600" size={32} />
          </div>
          <h1 className="text-2xl font-semibold text-rose-600">
            {loading ? "..." : stats.cancelled}
          </h1>
          <div className="font-semibold mt-1">Hoàn trả/Hủy</div>
        </div>
      </div>
    </Card>
  );
}

export default ReviewOrders;
