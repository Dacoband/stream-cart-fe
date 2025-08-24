"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createQRPayment } from "@/services/api/payment/payment";
import { PaymentResponse } from "@/types/payment/payment";
import Image from "next/image";
import { getOrderById } from "@/services/api/order/order";
import { Order } from "@/types/order/order";
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

  // Poll payment status for the first order every 6 seconds
  useEffect(() => {
    if (!firstOrderId) return;

    const poll = async () => {
      try {
        const res = await getOrderById(firstOrderId);
        const order: Order = res?.data ?? res; // handle either wrapped or raw
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
        // else pending: do nothing
      } catch (e) {
        // On error, do nothing; next tick will retry
        console.warn("Polling payment status failed", e);
      }
    };

    // initial delay of 6s then repeat
    pollTimerRef.current = setInterval(poll, 6000);
    // also invoke once after first 6s instead of immediately

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    };
  }, [firstOrderId, ordersParam, router]);

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Thanh toán đơn hàng
      </h1>

      {loading && <p className="text-center">Đang tạo mã QR thanh toán...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {qrData && (
        <div className="flex flex-col items-center gap-4 mt-6">
          <Image
            width={288}
            height={288}
            src={qrData.qrCode.split("|")[0]}
            alt="QR Code Thanh Toán"
            className="w-72 h-72 object-contain border p-2 rounded-lg"
          />
          <div className="text-center">
            <p>
              <span className="font-medium">Mã thanh toán:</span>{" "}
              {qrData.paymentId}
            </p>
            <p>
              <span className="font-medium">Nội dung chuyển khoản:</span>{" "}
              {qrData.description}
            </p>
            <p className="text-green-600 font-semibold">
              Tổng tiền: {qrData.totalAmount.toLocaleString("vi-VN")}đ
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
