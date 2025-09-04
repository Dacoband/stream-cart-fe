"use client";

import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { getOrderCompletionRate } from "@/services/api/order/getOrders";

function OrderCompletionRate() {
  const { user } = useAuth();
  const [completionRate, setCompletionRate] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchCompletionRate = useCallback(async () => {
    if (!user?.shopId) return;
    
    try {
      setLoading(true);
      const rate = await getOrderCompletionRate(user.shopId);
      setCompletionRate(rate);
    } catch (error) {
      console.error("Error fetching completion rate:", error);
      setCompletionRate(0);
    } finally {
      setLoading(false);
    }
  }, [user?.shopId]);

  useEffect(() => {
    fetchCompletionRate();
  }, [fetchCompletionRate]);

  return (
    <Card className="p-4">
      <h3 className="font-bold text-xl mb-4">Tỉ lệ hoàn thành đơn</h3>
      <div className="flex flex-col items-center justify-center rounded-xl bg-green-50 py-8">
        <div className="bg-green-200 rounded-xl p-4 mb-4">
          <CheckCircle className="text-green-600" size={48} />
        </div>
        <h1 className="text-4xl font-bold text-green-600 mb-2">
          {loading ? "..." : `${completionRate}%`}
        </h1>
        <div className="text-sm text-gray-600 text-center max-w-xs">
          Tỉ lệ đơn hàng được giao thành công và hoàn thành trên tổng số đơn hàng
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Bao gồm: Giao thành công + Hoàn thành
        </div>
      </div>
    </Card>
  );
}

export default OrderCompletionRate;
