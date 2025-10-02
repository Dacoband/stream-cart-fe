"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import PriceTag from "@/components/common/PriceTag";
import { formatFullDateTimeVN } from "@/components/common/formatFullDateTimeVN";

import {
  getRefundById,
  updateRefundStatus,
} from "@/services/api/refund/refund";
import { getOrderById } from "@/services/api/order/order";
import { getOrderProductByOrderId } from "@/services/api/order/ordersItem";
import { getUserById } from "@/services/api/auth/account";

import { RefundRequestDto, RefundStatus } from "@/types/refund/refund";
import { OrderItemResponse } from "@/types/order/order";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import {
  ArrowLeft,
  Receipt,
  CheckCircle2,
  XCircle,
  HandCoins,
  Package,
  ClipboardList,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { AxiosError } from "axios";

const isEmptyGuid = (id?: string | null) =>
  !id || id === "00000000-0000-0000-0000-000000000000";

const StatusBadge: React.FC<{ status: RefundStatus }> = ({ status }) => {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1";
  switch (status) {
    case RefundStatus.Created:
      return (
        <span
          className={`${base} bg-yellow-50 text-yellow-800 ring-yellow-200`}
        >
          Gửi yêu cầu
        </span>
      );
    case RefundStatus.Confirmed:
    case RefundStatus.Packed:
    case RefundStatus.OnDelivery:
    case RefundStatus.Delivered:
      return (
        <span className={`${base} bg-blue-50 text-blue-800 ring-blue-200`}>
          Đang xử lý
        </span>
      );
    case RefundStatus.Completed:
      return (
        <span className={`${base} bg-green-50 text-green-800 ring-green-200`}>
          Hoàn hàng thành công
        </span>
      );
    case RefundStatus.Refunded:
      return (
        <span
          className={`${base} bg-emerald-50 text-emerald-800 ring-emerald-200`}
        >
          Hoàn tiền thành công
        </span>
      );
    case RefundStatus.Rejected:
      return (
        <span className={`${base} bg-red-50 text-red-700 ring-red-200`}>
          Bị từ chối
        </span>
      );
    default:
      return (
        <span className={`${base} bg-gray-50 text-gray-700 ring-gray-200`}>
          Không xác định
        </span>
      );
  }
};

type EnrichedDetail = {
  productName?: string;
  productImageUrl?: string;
  quantity?: number;
  totalPrice?: number;
  reason?: string;
  unitPrice?: number;
  evidenceUrl?: string | null;
};

export default function RefundDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refund, setRefund] = useState<RefundRequestDto | null>(null);

  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [requestedByName, setRequestedByName] = useState<string | null>(null);
  const [processedByName, setProcessedByName] = useState<string | null>(null);
  const [items, setItems] = useState<OrderItemResponse[]>([]);
  const [enrichedDetails, setEnrichedDetails] = useState<
    Record<string, EnrichedDetail>
  >({});

  useEffect(() => {
    const fetchAll = async () => {
      if (!id) return;
      setLoading(true);

      try {
        const r = await getRefundById(id);
        setRefund(r);
        console.log("Processed by user:", r);
        if (r?.orderId) {
          try {
            const ord = await getOrderById(r.orderId);
            const code =
              ord?.data?.data?.orderCode ??
              ord?.data?.orderCode ??
              ord?.orderCode;
            if (code) setOrderCode(code);

            const itemsPayload = await getOrderProductByOrderId(r.orderId);
            let orderItems: OrderItemResponse[] = [];
            if (Array.isArray(itemsPayload)) orderItems = itemsPayload;
            else if (itemsPayload?.items) orderItems = itemsPayload.items;
            else if (itemsPayload?.data?.items)
              orderItems = itemsPayload.data.items;
            setItems(orderItems);
          } catch (e) {
            console.warn("Order fetch warning:", e);
          }
        }

        if (r?.requestedByUserId) {
          try {
            const u = await getUserById(r.requestedByUserId);
            setRequestedByName(
              u?.fullname || u?.fullName || u?.username || null
            );
          } catch {}
        }
        if (r?.lastModifiedBy && !isEmptyGuid(r.lastModifiedBy)) {
          try {
            const u = await getUserById(r.lastModifiedBy);
            setProcessedByName(
              u?.fullname || u?.fullName || u?.username || null
            );

            console.log("Processed by user:", u);
          } catch {}
        }
      } catch (e) {
        console.error(e);
        toast.error("Không thể tải chi tiết yêu cầu hoàn hàng");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  useEffect(() => {
    if (!refund?.refundDetails || items.length === 0) return;
    const map: Record<string, EnrichedDetail> = {};
    for (const d of refund.refundDetails) {
      const oi = items.find((i) => i.id === d.orderItemId);
      map[d.id] = {
        productName: oi?.productName,
        productImageUrl: oi?.productImageUrl,
        quantity: oi?.quantity,
        totalPrice: oi?.totalPrice,
        reason: d.reason,
        unitPrice: d.unitPrice,
        evidenceUrl: d.imageUrl ?? null,
      };
    }
    setEnrichedDetails(map);
  }, [refund, items]);

  const canApproveReject = refund?.status === RefundStatus.Created;
  const canRefundMoney = refund?.status === RefundStatus.Completed;

  const handleApprove = async () => {
    if (!refund) return;
    try {
      setSaving(true);
      await updateRefundStatus({
        refundRequestId: refund.id,
        newStatus: RefundStatus.Confirmed,
      });
      toast.success("Đã phê duyệt yêu cầu");
      setRefund({
        ...refund,
        status: RefundStatus.Confirmed,
        processedAt: new Date().toISOString(),
      });
    } catch (error: unknown) {
      console.error("Approve fail:", error);
      const err = error as AxiosError<{ message?: string; errors?: string[] }>;
      const message =
        err?.response?.data?.errors?.[0] ||
        err?.response?.data?.message ||
        "Phê duyệt thất bại!";

      toast.error(message);
      toast.error("Phê duyệt thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!refund) return;
    try {
      setSaving(true);
      await updateRefundStatus({
        refundRequestId: refund.id,
        newStatus: RefundStatus.Rejected,
      });
      toast.success("Đã từ chối yêu cầu");
      setRefund({
        ...refund,
        status: RefundStatus.Rejected,
        processedAt: new Date().toISOString(),
      });
    } catch (error: unknown) {
      console.error("Reject fail:", error);
      const err = error as AxiosError<{ message?: string; errors?: string[] }>;
      const message =
        err?.response?.data?.errors?.[0] ||
        err?.response?.data?.message ||
        "Từ chối bị thất bại!";

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const router = useRouter();

  const handleRefundMoney = () => {
    if (!refund) return;
    // Chuyển sang trang payment để xử lý QR + polling
    router.push(`/manager/refund/payment?id=${refund.id}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-5 min-h-full">
        <div className="bg-white sticky top-0 z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
          <Skeleton className="h-6 w-60" />
        </div>
        <div className="mx-5 mb-10 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!refund) {
    return (
      <div className="flex flex-col gap-5 min-h-full">
        <div className="bg-white sticky top-0 z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
          <h2 className="text-xl font-bold">Yêu cầu hoàn hàng không tồn tại</h2>
        </div>
        <div className="mx-5 mb-10 text-center py-10">
          <p className="text-gray-500 mb-4">Không tìm thấy yêu cầu này</p>
          <Link href="/refunds">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  //  Không cộng phí vận chuyển vào Tổng hoàn lại
  const totalRefundOnlyItems = refund.refundAmount;

  return (
    <div className="flex flex-col gap-5 min-h-full">
      {/* Header/Breadcrumb + actions */}
      <div className="bg-white sticky top-0 z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="font-medium text-lg cursor-pointer">
              <BreadcrumbLink asChild>
                <Link href="manager/refunds">Yêu cầu hoàn hàng</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium text-lg">
                {orderCode || "—"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex gap-2">
          {canApproveReject && (
            <>
              <Button
                variant="outline"
                disabled={saving}
                className="border-red-200 text-red-600 hover:bg-red-50"
                onClick={handleReject}
              >
                <XCircle className="w-4 h-4 mr-2 text-red-500" /> Từ chối
              </Button>
              <Button
                variant="outline"
                disabled={saving}
                className="border-green-200 text-green-600 hover:bg-green-50"
                onClick={handleApprove}
              >
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" /> Phê
                duyệt
              </Button>
            </>
          )}
          {canRefundMoney && (
            <Button
              variant="outline"
              disabled={saving}
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              onClick={handleRefundMoney}
            >
              <HandCoins className="w-4 h-4 mr-2 text-emerald-600" /> Hoàn tiền
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-10 mb-10 space-y-5">
        {/* Tổng quan */}
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-lime-600" />
              Tổng quan yêu cầu
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Mã đơn hàng:</span>
                <span className="font-semibold">{orderCode || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Trạng thái:</span>
                <span>
                  <StatusBadge status={refund.status} />
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ngày yêu cầu:</span>
                <span>{formatFullDateTimeVN(refund.requestedAt)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Số tiền hoàn:</span>
                <span className="text-rose-600 font-semibold">
                  <PriceTag value={refund.refundAmount} />
                </span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển hoàn:</span>
                <span>
                  <PriceTag value={refund.shippingFee} />
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tổng hoàn lại:</span>
                <span className="text-rose-600 font-semibold">
                  <PriceTag value={totalRefundOnlyItems} />
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Người yêu cầu:</span>
                <span className="font-medium">{requestedByName || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Người xử lý:</span>
                <span className="font-medium">
                  {isEmptyGuid(refund.lastModifiedBy)
                    ? "—"
                    : processedByName || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Thời gian xử lý:</span>
                <span>
                  {refund.lastModifiedAt
                    ? formatFullDateTimeVN(refund.lastModifiedAt)
                    : "—"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sản phẩm/Chi tiết hoàn */}
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-lime-600" />
              Sản phẩm trong yêu cầu
            </CardTitle>
          </CardHeader>
          <CardContent>
            {refund.refundDetails?.length ? (
              <div className="border rounded-md overflow-hidden">
                {/* ✅ Header màu #B0F847/50 */}
                <div className="grid grid-cols-20 bg-[#B0F847]/50 text-sm font-medium text-gray-700 px-4 py-2">
                  <div className="col-span-1">STT</div>
                  <div className="col-span-7">Sản phẩm</div>
                  <div className="col-span-4">Đơn giá</div>
                  <div className="col-span-4">Lý do</div>
                  <div className="col-span-4 text-right">Thành tiền</div>
                </div>

                {refund.refundDetails.map((d, idx) => {
                  const info = enrichedDetails[d.id] || {};
                  return (
                    <div
                      key={d.id}
                      className="grid grid-cols-20 gap-3 px-4 py-3 border-t"
                    >
                      <div className="col-span-1 flex items-center text-sm text-gray-700">
                        {idx + 1}
                      </div>
                      <div className="col-span-7 flex gap-3">
                        <Image
                          src={info.productImageUrl || "/assets/emptydata.png"}
                          alt={info.productName || "product"}
                          width={64}
                          height={64}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          {/* ✅ Cho phép xuống dòng, tránh bể layout */}
                          <div
                            className="font-medium text-gray-900 break-words whitespace-normal leading-snug"
                            title={info.productName}
                          >
                            {info.productName || "—"}
                          </div>
                          {info.quantity !== undefined && (
                            <div className="text-xs text-gray-600 mt-0.5">
                              Số lượng: {info.quantity}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-span-4 text-sm text-gray-700">
                        <PriceTag value={d.unitPrice} />
                      </div>
                      <div className="col-span-4 text-sm text-gray-700">
                        <div className="whitespace-pre-wrap break-words leading-snug">
                          {d.reason || info.reason || "—"}
                        </div>
                        {(d.imageUrl || info.evidenceUrl) && (
                          <a
                            href={d.imageUrl || info.evidenceUrl || undefined}
                            target="_blank"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Xem ảnh minh chứng
                          </a>
                        )}
                      </div>
                      <div className="col-span-4 text-right font-medium text-rose-600">
                        <PriceTag value={info.totalPrice ?? d.unitPrice} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ClipboardList className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Không có chi tiết hoàn hàng</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ghi chú */}
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-lime-600" />
              Ghi chú
            </CardTitle>
          </CardHeader>
          <CardContent>
            {refund.lastModifiedAt || refund.createdAt ? (
              <div className="grid gap-2 md:grid-cols-2">
                <div className="text-sm text-gray-700">
                  <span className="text-gray-500">Tạo lúc: </span>
                  <span className="font-medium">
                    {refund.createdAt
                      ? formatFullDateTimeVN(refund.createdAt)
                      : "—"}
                  </span>
                </div>
                <div className="text-sm text-gray-700">
                  <span className="text-gray-500">Cập nhật gần nhất: </span>
                  <span className="font-medium">
                    {refund.lastModifiedAt
                      ? formatFullDateTimeVN(refund.lastModifiedAt)
                      : "—"}
                  </span>
                </div>
              </div>
            ) : (
              <Input
                className="text-gray-500"
                value="Không có ghi chú thêm"
                readOnly
              />
            )}
          </CardContent>
        </Card>

        {/* Thông tin hoàn tiền */}
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-lime-600" />
              Thông tin hoàn tiền
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Tổng tiền hàng hoàn:</span>
                <span className="text-rose-600 font-semibold">
                  <PriceTag value={refund.refundAmount} />
                </span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển hoàn:</span>
                <span>
                  <PriceTag value={refund.shippingFee} />
                </span>
              </div>
              <hr />
              <div className="flex justify-between font-medium text-base">
                <span>Tổng hoàn lại:</span>
                <span className="text-rose-600">
                  {/* ✅ chỉ dùng refundAmount */}
                  <PriceTag value={totalRefundOnlyItems} />
                </span>
              </div>
              {refund.transactionId && (
                <div className="flex justify-between gap-2">
                  <span>Mã giao dịch:</span>
                  <span
                    className="truncate max-w-[200px] text-right"
                    title={refund.transactionId}
                  >
                    {refund.transactionId}
                  </span>
                </div>
              )}
              {refund.trackingCode && (
                <div className="flex justify-between gap-2">
                  <span>Mã vận đơn:</span>
                  <span
                    className="truncate max-w-[200px] text-right"
                    title={refund.trackingCode}
                  >
                    {refund.trackingCode}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
