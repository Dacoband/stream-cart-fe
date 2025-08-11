"use client";

import React from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export const OrderDetailModal = ({ order }: { order: any }) => {
  if (!order) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Không xác định";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Không xác định";
    return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
  };

  return (
    <DialogContent className="!max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-lg font-bold">
          Chi tiết đơn hàng: {order.orderId}
        </DialogTitle>
      </DialogHeader>

      {/* Thông tin chung */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mt-4">
        <div className="space-y-2">
          <p>
            <strong>Khách hàng:</strong> {order.customerName}
          </p>
          <p>
            <strong>SĐT:</strong> {order.shippingAddress?.phone}
          </p>
          <p>
            <strong>Địa chỉ giao hàng:</strong>{" "}
            <span className="block text-gray-700">
              {[
                order.shippingAddress?.addressLine1,
                order.shippingAddress?.ward,
                order.shippingAddress?.district,
                order.shippingAddress?.city,
              ]
                .filter(Boolean)
                .join(", ")}
            </span>
          </p>
          <p>
            <strong>Ghi chú:</strong>{" "}
            <span className="italic text-gray-600">
              {order.customerNotes || "Không có"}
            </span>
          </p>
        </div>

        <div className="space-y-2">
          <p>
            <strong>Ngày đặt:</strong> {formatDate(order.createdAt)}
          </p>
          <p>
            <strong>Ngày giao dự kiến:</strong>{" "}
            {formatDate(order.estimatedDeliveryDate)}
          </p>
          <p>
            <strong>Mã vận đơn:</strong>{" "}
            <span className="font-medium text-gray-700">
              {order.trackingCode || "—"}
            </span>
          </p>
          <p>
            <strong>Trạng thái:</strong>{" "}
            <Badge variant="outline" className="bg-slate-100 text-gray-800">
              {order.status}
            </Badge>
          </p>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="mt-6">
        <h4 className="text-base font-semibold mb-2">Sản phẩm</h4>
        <ScrollArea className="max-h-[300px] border rounded-md">
          <Table className="">
            <TableHeader className="bg-[#B0F847]/50">
              <TableRow>
                <TableHead className="w-[80px]">Hình ảnh</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead className="text-center">SL</TableHead>
                <TableHead className="text-right">Đơn giá</TableHead>
                <TableHead className="text-right">Giảm</TableHead>
                <TableHead className="text-right">Tổng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Image
                      src={item.productImageUrl}
                      alt={item.productName}
                      width={60}
                      height={60}
                      className="rounded border"
                    />
                  </TableCell>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {item.unitPrice.toLocaleString("vi-VN")} đ
                  </TableCell>
                  <TableCell className="text-right">
                    {item.discountAmount.toLocaleString("vi-VN")} đ
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {item.totalPrice.toLocaleString("vi-VN")} đ
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Tổng kết */}
      <div className="mt-6 space-y-1 text-sm text-right border-t pt-4">
        <p>Phí vận chuyển: {order.shippingFee.toLocaleString("vi-VN")} đ</p>
        <p>Giảm giá: {order.discountAmount.toLocaleString("vi-VN")} đ</p>
        <p className="font-semibold text-base text-green-700">
          Tổng tiền: {order.finalAmount.toLocaleString("vi-VN")} đ
        </p>
      </div>
    </DialogContent>
  );
};
