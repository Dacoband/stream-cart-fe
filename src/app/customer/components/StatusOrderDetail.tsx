"use client";
import React, { type FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/types/order/order";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
  Truck,
  type LucideIcon,
} from "lucide-react";

type Props = { order: Order };

function getStatusInfo(status: number) {
  const statusMap: Record<
    number,
    { label: string; color: string; icon: LucideIcon; description: string }
  > = {
    0: {
      label: "Chờ thanh toán",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Clock,
      description: "Bạn cần thanh toán để tiếp tục đơn hàng",
    },
    1: {
      label: "Chờ xác nhận",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Clock,
      description: "Đơn hàng đang chờ shop xác nhận",
    },
    2: {
      label: "Đang chuẩn bị",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: CheckCircle,
      description: "Shop đang đóng gói",
    },
    3: {
      label: "Chờ lấy hàng",
      color: "bg-purple-100 text-purple-800 border-purple-200",
      icon: Package,
      description: "Đơn vị vận chuyển đang đến lấy hàng",
    },
    7: {
      label: "Đang giao hàng",
      color: "bg-orange-100 text-orange-800 border-orange-200",
      icon: Truck,
      description: "Đơn hàng đang được vận chuyển",
    },
    4: {
      label: "Đã giao hàng",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle,
      description: "Đơn hàng đã được giao thành công",
    },
    5: {
      label: "Đã hủy",
      color: "bg-red-100 text-red-800 border-red-200",
      icon: CheckCircle,
      description: "Đơn hàng đã bị hủy",
    },
    10: {
      label: "Đã hoàn thành",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle,
      description: "Đơn hàng đã hoàn thành",
    },
  };

  return (
    statusMap[status] || {
      label: "Không xác định",
      color: "bg-gray-100 text-gray-800 border-gray-200",
      icon: AlertCircle,
      description: "Trạng thái không xác định",
    }
  );
}

const StatusOrderDetail: FC<Props> = ({ order }) => {
  const statusInfo = getStatusInfo(order.orderStatus);
  const StatusIcon = statusInfo.icon;
  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-full shadow-sm">
              <StatusIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Đơn hàng #{order.orderCode}
              </h1>
              <p className="text-gray-600 mt-1">
                Đặt hàng lúc {new Date(order.orderDate).toLocaleString("vi-VN")}
              </p>
            </div>
          </div>
          <Badge
            className={`px-4 py-2 text-sm font-medium ${statusInfo.color}`}
          >
            {statusInfo.label}
          </Badge>
        </div>
        <p className="text-gray-700 mt-3 text-sm">{statusInfo.description}</p>
      </div>

      {order.trackingCode && (
        <CardContent className="border-t bg-blue-25">
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
            <Truck className="w-8 h-8 text-blue-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                Thông tin vận chuyển
              </h3>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Mã vận đơn:</span>
                  <span className="font-mono text-sm font-medium">
                    {order.trackingCode}
                  </span>
                </div>
                {order.estimatedDeliveryDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Dự kiến giao:</span>
                    <span className="text-sm font-medium">
                      {new Date(order.estimatedDeliveryDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </span>
                  </div>
                )}
                {order.actualDeliveryDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Đã giao:</span>
                    <span className="text-sm font-medium text-green-600">
                      {new Date(order.actualDeliveryDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default StatusOrderDetail;
