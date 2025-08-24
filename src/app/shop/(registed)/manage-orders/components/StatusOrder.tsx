"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ClipboardList,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Order } from "@/types/order/order";
import { formatFullDateTimeVN } from "@/components/common/formatFullDateTimeVN";
import { updateOrderStatus } from "@/services/api/order/order";
import { toast } from "sonner";

type Props = {
  order: Order;
  onStatusUpdated?: (newStatus: number) => void;
};

const statusConfig: Record<
  number,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    needsAction: boolean;
    description: string;
  }
> = {
  1: {
    label: "Chờ xác nhận",
    icon: AlertCircle,
    color: "bg-orange-500",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
    needsAction: true,
    description: "Đơn hàng đang chờ xác nhận từ người bán",
  },
  2: {
    label: "Đang chuẩn bị hàng",
    icon: Clock,
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    needsAction: true,
    description: "Đơn hàng đang chờ đóng gói ",
  },
  3: {
    label: "Chờ lấy hàng",
    icon: Package,
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    needsAction: false,
    description: "Đơn hàng đã sẵn sàng để bên vận chuyển đến lấy",
  },
  7: {
    label: "Đang giao hàng",
    icon: Truck,
    color: "bg-indigo-500",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
    borderColor: "border-indigo-200",
    needsAction: false,
    description: "Đơn hàng đang được vận chuyển",
  },
  4: {
    label: "Giao thành công",
    icon: CheckCircle,
    color: "bg-green-500",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    needsAction: false,
    description: "Đơn hàng đã giao thành công",
  },
  10: {
    label: "Thành công",
    icon: CheckCircle,
    color: "bg-green-500",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    needsAction: false,
    description: "Đơn hàng đã giao thành công",
  },
  5: {
    label: "Đã hủy",
    icon: XCircle,
    color: "bg-red-500",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    needsAction: false,
    description: "Đơn hàng đã bị hủy",
  },
};

const statusFlow = [1, 2, 3, 7, 4];

export default function StatusOrder({ order, onStatusUpdated }: Props) {
  const [updating, setUpdating] = useState(false);
  const [confirmPickupOpen, setConfirmPickupOpen] = useState(false);

  const currentConfig = statusConfig[order.orderStatus];
  const currentIndex = statusFlow.indexOf(order.orderStatus);

  const deadlineMessage =
    order.orderStatus === 1
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

  // Nếu bị hủy thì hiển thị đơn giản
  if (order.orderStatus === 5) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-lime-500 to-green-600">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Trạng thái đơn hàng
                </h3>
                <p className="text-sm text-gray-500">
                  Mã đơn: {order.orderCode}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Ngày đặt</p>
              <p className="text-sm font-medium text-gray-900">
                {formatFullDateTimeVN(order.orderDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
            <XCircle className="w-6 h-6 text-red-600" />
            <div>
              <p className="font-medium text-red-700">
                Đơn hàng này đã bị hủy đã bị hủy
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
      <CardContent className="">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-lime-500 to-green-600">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Trạng thái đơn hàng
              </h3>
              <p className="text-sm text-gray-500">Mã đơn: {order.orderCode}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Ngày đặt</p>
            <p className="text-sm font-medium text-gray-900">
              {formatFullDateTimeVN(order.orderDate)}
            </p>
          </div>
        </div>

        {/* Current Status Display */}
        <div
          className={`p-4 rounded-xl ${currentConfig.bgColor} ${currentConfig.borderColor} border-2 mb-6`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${currentConfig.color}`}>
                <currentConfig.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <Badge
                  className={`${currentConfig.bgColor} ${currentConfig.textColor} border-0 font-medium`}
                >
                  {currentConfig.label}
                </Badge>
                <p className="text-sm text-gray-600 mt-1">
                  {currentConfig.description}
                </p>
              </div>
            </div>

            {deadlineMessage && (
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-2">Hạn xử lí</p>
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {deadlineMessage}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Status Timeline */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">
            Tiến trình đơn hàng
          </h4>
          <div className="flex items-center justify-between relative">
            {statusFlow.map((status, index) => {
              const config = statusConfig[status];
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;

              return (
                <div
                  key={status}
                  className="flex flex-col items-center flex-1 relative"
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrent
                        ? `${config.color} text-white`
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    <config.icon className="w-4 h-4" />
                  </div>
                  <p
                    className={`text-xs text-center ${
                      isCurrent ? "font-medium text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {config.label}
                  </p>
                  {index < statusFlow.length - 1 && (
                    <div
                      className={`absolute top-4 left-1/2 w-full h-0.5 -z-10 ${
                        isCompleted ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        {currentConfig.needsAction && (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-gray-700">
                {order.orderStatus === 1
                  ? "Xác nhận đơn hàng"
                  : "Đã đóng gói xong"}
              </span>
            </div>
            <Button
              onClick={() => {
                if (order.orderStatus === 2) {
                  setConfirmPickupOpen(true);
                } else {
                  handleUpdateStatus();
                }
              }}
              disabled={updating}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium px-6"
            >
              {updating
                ? "Đang cập nhật..."
                : order.orderStatus === 0 || order.orderStatus === 1
                ? "Xác nhận đơn hàng"
                : order.orderStatus === 2
                ? "Đã đóng gói xong"
                : "Bắt đầu xử lí"}
            </Button>
          </div>
        )}

        {/* Confirm pickup dialog for status 2 */}
        <AlertDialog
          open={confirmPickupOpen}
          onOpenChange={setConfirmPickupOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận yêu cầu vận chuyển</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn đã đóng gói xong đơn hàng và muốn yêu cầu đơn vị vận chuyển
                đến lấy hàng?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={updating}>Hủy</AlertDialogCancel>
              <AlertDialogAction
                disabled={updating}
                onClick={async () => {
                  setConfirmPickupOpen(false);
                  await handleUpdateStatus();
                }}
              >
                Xác nhận
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
