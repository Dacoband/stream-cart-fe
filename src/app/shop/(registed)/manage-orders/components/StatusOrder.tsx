"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";
import { Order } from "@/types/order/order";
import { formatFullDateTimeVN } from "@/components/common/formatFullDateTimeVN";
import { updateOrderStatus } from "@/services/api/order/order";
import { toast } from "sonner";

type Props = {
  order: Order;
  onStatusUpdated?: (newStatus: number) => void;
};

const getStatusInfo = (status: number) => {
  switch (status) {
    case 0:
    case 1:
      return { text: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700" };
    case 2:
      return { text: "Chờ xử lí", color: "bg-orange-100 text-orange-700" };
    case 3:
      return { text: "Chờ lấy hàng", color: "bg-blue-100 text-blue-700" };
    case 4:
      return {
        text: "Giao hàng thành công",
        color: "bg-green-100 text-green-700",
      };
    case 5:
      return { text: "Đã hủy", color: "bg-red-100 text-red-700" };
    case 7:
      return { text: "Chờ giao hàng", color: "bg-indigo-100 text-indigo-700" };
    case 10:
      return { text: "Thành công", color: "bg-emerald-100 text-emerald-700" };
    default:
      return { text: "Đang giao", color: "bg-gray-100 text-gray-700" };
  }
};

export default function StatusOrder({ order, onStatusUpdated }: Props) {
  const [updating, setUpdating] = useState(false);

  const statusInfo = getStatusInfo(order.orderStatus);
  const canUpdateStatus =
    order.orderStatus === 0 ||
    order.orderStatus === 1 ||
    order.orderStatus === 2;

  const deadlineMessage =
    order.orderStatus === 0 || order.orderStatus === 1
      ? `Vui lòng xác nhận đơn trước ${formatFullDateTimeVN(order.timeForShop)}`
      : order.orderStatus === 2
      ? `Vui lòng đóng gói trước ${formatFullDateTimeVN(
          order.timeForShop
        )} để giao hàng cho bên vận chuyển`
      : null;

  const handleUpdateStatus = async () => {
    if (updating) return;

    let newStatus: number | null = null;
    if (order.orderStatus === 0 || order.orderStatus === 1) newStatus = 2;
    else if (order.orderStatus === 2) newStatus = 3;
    else newStatus = null;

    if (newStatus == null) {
      toast.info("Không thể cập nhật trạng thái đơn hàng này");
      return;
    }

    try {
      setUpdating(true);
      await updateOrderStatus(order.id, newStatus);
      onStatusUpdated?.(newStatus);
      toast.success("Cập nhật trạng thái đơn hàng thành công");
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Không thể cập nhật trạng thái đơn hàng");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle className="flex gap-5 items-center justify-between">
          <div className="flex  items-center gap-2 text-lg font-semibold ">
            <ClipboardList className="w-5 h-5 text-lime-600" />
            Trạng thái đơn hàng
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium shadow-sm ${statusInfo.color}`}
          >
            {statusInfo.text}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Trạng thái */}

          {/* Ngày đặt + Deadline */}
          <div className="flex flex-col text-sm text-gray-600">
            <p className="flex items-center gap-1">
              <span className="font-medium">Ngày đặt:</span>{" "}
              {formatFullDateTimeVN(order.orderDate)}
            </p>
            {deadlineMessage && (
              <p className="flex items-center gap-1 text-orange-600 font-medium">
                ⏰ {deadlineMessage}
              </p>
            )}
          </div>

          {/* Nút cập nhật */}
          {canUpdateStatus && (
            <Button
              onClick={handleUpdateStatus}
              disabled={updating}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-sm"
            >
              {updating ? "Đang cập nhật..." : "Cập nhật trạng thái"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
