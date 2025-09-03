"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createQRPayment } from "@/services/api/payment/payment";
import { PaymentResponse } from "@/types/payment/payment";
import Image from "next/image";
import { getOrderById } from "@/services/api/order/order";
import { Order } from "@/types/order/order";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrderPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [qrData, setQrData] = useState<PaymentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const ordersParam = searchParams.get("orders") ?? "";
  const orderIds = useMemo(
    () =>
      ordersParam
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    [ordersParam]
  );
  const firstOrderId = orderIds[0];

  useEffect(() => {
    if (!ordersParam) {
      setError("Không tìm thấy đơn hàng.");
      return;
    }

    setLoading(true);
    createQRPayment(orderIds)
      .then((res) => {
        setQrData(res);
        setError(null);
      })
      .catch(() => {
        setError("Không thể tạo mã thanh toán. Vui lòng thử lại.");
      })
      .finally(() => setLoading(false));
  }, [ordersParam, orderIds]);

  // Poll payment status
  useEffect(() => {
    if (!firstOrderId) return;

    const poll = async () => {
      try {
        const res = await getOrderById(firstOrderId);
        const order: Order = res?.data ?? res;
        const status = Number(order?.paymentStatus ?? 0);
        if (status === 1) {
          router.push(
            `/payment/order/results-success?orders=${encodeURIComponent(
              ordersParam
            )}`
          );
          return;
        }
        if (status !== 0) {
          router.push(
            `/payment/order/results-failed?orders=${encodeURIComponent(
              ordersParam
            )}`
          );
          return;
        }
      } catch (e) {
        console.warn("Polling payment status failed", e);
      }
    };

    pollTimerRef.current = setInterval(poll, 5000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    };
  }, [firstOrderId, ordersParam, router]);

  return (
    <div className="relative min-h-screen w-full bg-black flex items-center justify-center px-4 py-8 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0">
        {/* Gradient loang chính */}
        <div
          className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{
            background: `radial-gradient(circle, #B0F847 0%, #B0F847 30%, transparent 70%)`,
          }}
        />

        {/* Gradient loang phụ */}
        <div
          className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full opacity-20 blur-2xl"
          style={{
            background: `radial-gradient(circle, #B0F847 0%, #B0F847 40%, transparent 80%)`,
          }}
        />

        {/* Gradient loang nhỏ */}
        <div
          className="absolute bottom-1/3 left-1/4 w-48 h-48 rounded-full opacity-25 blur-xl"
          style={{
            background: `radial-gradient(circle, #B0F847 0%, #B0F847 50%,#B0F847 20%, transparent 90%)`,
          }}
        />

        {/* Overlay mờ */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
      </div>

      {/* Nội dung chính */}
      <div className="relative z-10 max-w-xl w-full">
        <Card className="py-5 px-0  w-[480px] mx-auto">
          <h1 className="text-xl mt-2 font-bold  text-center">
            Thanh toán đơn hàng
          </h1>

          {loading && <Skeleton className="w-80 h-80"></Skeleton>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {qrData && (
            <div className="flex flex-col items-center   w-96 mx-auto ">
              <Image
                width={384}
                height={384}
                src={qrData.qrCode.split("|")[0]}
                alt="QR Code Thanh Toán"
                className="w-80 h-80 object-contain  "
              />
              <div className="p-4 space-y-3">
                {/* Tổng tiền */}
                <div className="flex gap-2 justify-between">
                  <p className="font-medium whitespace-nowrap text-gray-600 ">
                    Tổng tiền:
                  </p>
                  <p className="text-rose-600 font-semibold">
                    {qrData.totalAmount.toLocaleString("vi-VN")}đ
                  </p>
                </div>

                {/* Số lượng đơn */}
                <div className="flex gap-2 justify-between">
                  <p className="font-medium text-gray-600  whitespace-nowrap">
                    Số lượng đơn:
                  </p>
                  <p>{qrData.orderCount}</p>
                </div>

                {/* Nội dung chuyển khoản */}
                <div className="flex gap-4">
                  <p className="font-medium text-gray-600 whitespace-nowrap">
                    Nội dung chuyển khoản:
                  </p>
                  <p className="break-all text-sm">{qrData.description}</p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
