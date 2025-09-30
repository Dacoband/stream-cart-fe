"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PriceTag from "@/components/common/PriceTag";
import { RefundRequestDto, RefundStatus } from "@/types/refund/refund";
import { getOrderProductByOrderId } from "@/services/api/order/ordersItem";
import { getProductDetailById } from "@/services/api/product/product";
import { getOrderById } from "@/services/api/order/order";
import { updateRefundStatus } from "@/services/api/refund/refund";
import { BadgeCheck, PackageSearch, Truck, Barcode } from "lucide-react";
import { formatFullDateTimeVN } from "@/components/common/formatFullDateTimeVN";
import { OrderItemResponse } from "@/types/order/order";
import { Variant } from "@/types/product/product";
type Props = {
  refund: RefundRequestDto;
  onChanged?: () => void;
};

type FirstItem = {
  name?: string;
  image?: string;
  quantity?: number;
  attrsText?: string;
};

const StatusPill: React.FC<{ status: RefundStatus }> = ({ status }) => {
  const base = "inline-block py-1 px-2 text-xs text-white font-medium rounded";
  switch (status) {
    case RefundStatus.Created:
      return <span className={`${base} bg-yellow-600`}>Gửi yêu cầu</span>;
    case RefundStatus.Confirmed:
    case RefundStatus.Packed:
    case RefundStatus.OnDelivery:
    case RefundStatus.Delivered:
      return <span className={`${base} bg-blue-600`}>Đang xử lý</span>;
    case RefundStatus.Completed:
      return (
        <span className={`${base} bg-green-600`}>Hoàn hàng thành công</span>
      );
    case RefundStatus.Refunded:
      return (
        <span className={`${base} bg-emerald-600`}>Hoàn tiền thành công</span>
      );
    case RefundStatus.Rejected:
      return <span className={`${base} bg-rose-600`}>Bị từ chối</span>;
    default:
      return <span className={`${base} bg-gray-500`}>Không xác định</span>;
  }
};

export function ShopRefundItemCard({ refund, onChanged }: Props) {
  const [first, setFirst] = useState<FirstItem>({});
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        if (refund?.orderId) {
          // Fetch order để lấy orderCode + trackingCode (+ transactionId nếu có)
          const ordRes = await getOrderById(refund.orderId);
          const ord = ordRes?.data?.data ?? ordRes?.data ?? ordRes;
          if (!cancelled) {
            setOrderCode(ord?.orderCode ?? null);
            setTrackingCode(refund.trackingCode ?? null);
            setTransactionId(refund.transactionId ?? null); // tuỳ field BE
          }

          // Lấy sản phẩm đầu tiên
          if (refund.refundDetails?.length) {
            const firstDetail = refund.refundDetails[0];
            const orderItemsPayload = await getOrderProductByOrderId(
              refund.orderId
            );
            const orderItems = Array.isArray(orderItemsPayload)
              ? orderItemsPayload
              : orderItemsPayload?.items ??
                orderItemsPayload?.data?.items ??
                [];

            const oi = orderItems.find(
              (x: OrderItemResponse) => x.id === firstDetail.orderItemId
            );
            if (oi) {
              let attrsText = "";
              try {
                if (oi.productId && oi.variantId) {
                  const detail = await getProductDetailById(oi.productId);
                  const v = detail?.variants?.find(
                    (vv: Variant) => vv.variantId === oi.variantId
                  );
                  if (v?.attributeValues) {
                    attrsText = Object.entries(v.attributeValues)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(", ");
                  }
                }
              } catch {}
              if (!cancelled)
                setFirst({
                  name: oi.productName,
                  image: oi.productImageUrl,
                  quantity: oi.quantity,
                  attrsText,
                });
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [refund]);

  const canMarkPacked = useMemo(
    () => refund.status === RefundStatus.Confirmed,
    [refund.status]
  );

  const markPacked = async () => {
    try {
      setUpdating(true);
      await updateRefundStatus({
        refundRequestId: refund.id,
        newStatus: RefundStatus.Packed,
      });
      toast.success("Đã cập nhật: Đã chuẩn bị/đóng gói");
      onChanged?.();
    } catch (error) {
      console.log(error);
      toast.error("Cập nhật thất bại");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card className="mb-4 rounded-none p-0">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="text-sm text-black/70">
              Mã đơn hàng:{" "}
              <span className="font-medium text-black/90">
                {orderCode || "—"}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Ngày yêu cầu: {formatFullDateTimeVN(refund.requestedAt)}
            </div>
          </div>
          <StatusPill status={refund.status} />
        </div>

        {/* First item */}
        {first?.name && (
          <div className="flex gap-3 mb-3">
            <div className="w-16 h-16 relative rounded overflow-hidden bg-gray-100 flex-shrink-0">
              <Image
                src={first.image || "/assets/emptyData.png"}
                alt={first.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm break-words">
                {first.name}
              </div>
              {first.attrsText && (
                <div className="text-xs text-gray-600">{first.attrsText}</div>
              )}
              {typeof first.quantity === "number" && (
                <div className="text-xs text-gray-500">x{first.quantity}</div>
              )}
            </div>
            <PriceTag
              value={refund.refundAmount}
              className="text-sm text-rose-600"
            />
          </div>
        )}

        {/* Tổng + extra info */}
        <div className="border-t pt-2 text-sm text-gray-700 space-y-1">
          <div className="flex justify-between font-medium">
            <span>Tổng tiền hàng hoàn:</span>
            <PriceTag value={refund.refundAmount} className="text-orange-600" />
          </div>
          {trackingCode && (
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-lime-600" />
              <span>Mã vận đơn: {trackingCode}</span>
            </div>
          )}
          {refund.status === RefundStatus.Refunded && transactionId && (
            <div className="flex items-center gap-2">
              <Barcode className="w-4 h-4 text-emerald-600" />
              <span>Mã giao dịch: {transactionId}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-3">
          <Button
            variant="outline"
            className="rounded-none"
            onClick={() =>
              (window.location.href = `/customer/refund/${refund.id}`)
            }
          >
            <PackageSearch className="w-4 h-4 mr-1" />
            Xem chi tiết
          </Button>
          {canMarkPacked && (
            <Button
              className="bg-[#B0F847] rounded-none text-black hover:bg-[#B0F847]/80"
              disabled={updating}
              onClick={markPacked}
            >
              <BadgeCheck className="w-4 h-4 mr-1" />
              Đã chuẩn bị hàng
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
