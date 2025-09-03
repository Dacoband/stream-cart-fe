"use client";
import React, { type FC, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/types/order/order";
import {
  AlertCircle,
  CheckCircle,
  ClipboardList,
  Clock,
  Package,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateOrderStatus } from "@/services/api/order/order";
import { DialogAddReview } from "./DialogAddReview";
import { formatFullDateTimeVN } from "@/components/common/formatFullDateTimeVN";

type Props = { order: Order };

const StatusOrderDetail: FC<Props> = ({ order }) => {
  const router = useRouter();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [confirmReceiveOpen, setConfirmReceiveOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const statusFlow = [1, 2, 3, 7, 4];
  const displayConfig: Record<
    number,
    {
      label: string;
      icon: LucideIcon;
      color: string;
      bgColor: string;
      textColor: string;
      borderColor: string;
      description: string;
    }
  > = {
    0: {
      label: "Chờ thanh toán",
      icon: Clock,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      borderColor: "border-yellow-200",
      description: "Bạn cần thanh toán để tiếp tục đơn hàng",
    },
    1: {
      label: "Chờ xác nhận",
      icon: AlertCircle,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
      borderColor: "border-orange-200",
      description: "Đơn hàng đang chờ shop xác nhận",
    },
    2: {
      label: "Đang chuẩn bị hàng",
      icon: Clock,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      borderColor: "border-blue-200",
      description: "Shop đang đóng gói",
    },
    3: {
      label: "Chờ lấy hàng",
      icon: Package,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      borderColor: "border-purple-200",
      description: "Đơn vị vận chuyển đang đến lấy hàng",
    },
    7: {
      label: "Đang giao hàng",
      icon: Truck,
      color: "bg-indigo-500",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700",
      borderColor: "border-indigo-200",
      description: "Đơn hàng đang được vận chuyển",
    },
    4: {
      label: "Giao thành công",
      icon: CheckCircle,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      borderColor: "border-green-200",
      description: "Đơn hàng đã giao thành công",
    },
    10: {
      label: "Thành công",
      icon: CheckCircle,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      borderColor: "border-green-200",
      description: "Đơn hàng đã hoàn tất",
    },
    5: {
      label: "Đã hủy",
      icon: CheckCircle,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      borderColor: "border-red-200",
      description: "Đơn hàng đã bị hủy",
    },
  };

  const currentConfig = displayConfig[order.orderStatus] || {
    label: "Không xác định",
    icon: AlertCircle,
    color: "bg-gray-400",
    bgColor: "bg-gray-50",
    textColor: "text-gray-700",
    borderColor: "border-gray-200",
    description: "Trạng thái đơn hàng chưa xác định",
  };
  // For timeline: treat 10 (completed) as 4 (delivered) so they share the same final step
  const effectiveStatusForTimeline =
    order.orderStatus === 10 ? 4 : order.orderStatus;
  const currentIndex = Math.max(
    0,
    statusFlow.indexOf(effectiveStatusForTimeline)
  );
  const deadlineMessage =
    order.orderStatus === 1
      ? `Vui lòng chờ shop xác nhận trước ${
          order.timeForShop ? formatFullDateTimeVN(order.timeForShop) : ""
        }`
      : order.orderStatus === 2
      ? `Đơn hàng đang được chuẩn bị. Dự kiến đóng gói trước ${
          order.timeForShop ? formatFullDateTimeVN(order.timeForShop) : ""
        }`
      : order.orderStatus === 3
      ? `Đơn hàng sẵn sàng chờ đơn vị vận chuyển đến lấy`
      : order.orderStatus === 4
      ? `Đơn hàng giao thành công`
      : order.orderStatus === 10
      ? `Hoàn tất đơn hàng`
      : order.orderStatus === 5
      ? `Đơn hàng đã bị hủy`
      : null;

  const cancelOrder = async () => {
    try {
      setUpdating(true);
      await updateOrderStatus(order.id, 5);
      toast.success("Đã hủy đơn hàng");
      router.refresh();
    } catch {
      toast.error("Không thể hủy đơn hàng");
    } finally {
      setUpdating(false);
    }
  };

  const confirmReceived = async () => {
    try {
      setUpdating(true);
      await updateOrderStatus(order.id, 10);
      toast.success("Xác nhận đã nhận hàng");
      router.refresh();
    } catch {
      toast.error("Không thể xác nhận đơn hàng");
    } finally {
      setUpdating(false);
    }
  };
  return (
    <Card className="overflow-hidden">
      {/* Status Timeline and Current Status (seller-like) */}
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
        {order.orderStatus !== 5 && (
          <div className="mb-6">
            <div className="flex items-center justify-between relative">
              {statusFlow.map((status, index) => {
                const config = displayConfig[status];
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
                          ? "bg-[#B0F847] text-black"
                          : isCurrent
                          ? `${config.color} text-white`
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      <config.icon className="w-7 h-7" />
                    </div>
                    <p
                      className={`text-xs text-center ${
                        isCurrent
                          ? "font-medium text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      {config.label}
                    </p>
                    {index < statusFlow.length - 1 && (
                      <div
                        className={`absolute top-4 left-1/2 w-full h-0.5 -z-10 ${
                          isCompleted ? "bg-[#B0F847]" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div
          className={`p-4 rounded-xl ${currentConfig.bgColor} ${currentConfig.borderColor} border-2 mb-2`}
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
                {deadlineMessage && (
                  <p className="text-sm text-gray-600 mt-1 flex items-center">
                    {deadlineMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Actions */}
      <CardContent>
        <div className="flex items-center gap-2 justify-end">
          {order.orderStatus === 0 && (
            <>
              <Button
                variant="outline"
                className="border border-rose-500 rounded-none text-rose-600 hover:bg-rose-50 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCancelOpen(true);
                }}
                disabled={updating}
              >
                Hủy đơn
              </Button>
              <Button
                className="bg-[#B0F847] rounded-none text-black hover:brightness-95 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push(`/payment/order?orders=${order.id}`);
                }}
              >
                Thanh toán lại
              </Button>
            </>
          )}

          {(order.orderStatus === 1 || order.orderStatus === 2) && (
            <Button
              variant="outline"
              className="border border-rose-500 text-rose-600 hover:bg-rose-50 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCancelOpen(true);
              }}
              disabled={updating}
            >
              Hủy đơn
            </Button>
          )}

          {order.orderStatus === 4 && (
            <div className="flex gap-2">
              <Button className="bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-none cursor-pointer">
                Hoàn trả hàng
              </Button>
              <Button
                className="bg-[#B0F847] rounded-none text-black hover:bg-[#B0F847]/80 hover:text-black/80 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setConfirmReceiveOpen(true);
                }}
              >
                Đã nhận hàng
              </Button>
            </div>
          )}

          {order.orderStatus === 10 && (
            <Button
              variant="secondary"
              className="bg-[#B0F847] rounded-none text-black hover:brightness-95 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setReviewDialogOpen(true);
              }}
            >
              Đánh giá
            </Button>
          )}
        </div>
      </CardContent>

      {/* Confirm cancel */}
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy đơn hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>Quay lại</AlertDialogCancel>
            <AlertDialogAction
              disabled={updating}
              className="bg-red-600 hover:bg-red-600/90 text-white"
              onClick={async () => {
                await cancelOrder();
                setCancelOpen(false);
              }}
            >
              Xác nhận hủy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm received */}
      <AlertDialog
        open={confirmReceiveOpen}
        onOpenChange={setConfirmReceiveOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận đã nhận hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn xác nhận đã nhận được hàng và sản phẩm đúng mô tả?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>Quay lại</AlertDialogCancel>
            <AlertDialogAction
              disabled={updating}
              onClick={async () => {
                await confirmReceived();
                setConfirmReceiveOpen(false);
              }}
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Review Dialog */}
      <DialogAddReview
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        order={order}
        onSuccess={() => router.refresh()}
      />
    </Card>
  );
};

export default StatusOrderDetail;
