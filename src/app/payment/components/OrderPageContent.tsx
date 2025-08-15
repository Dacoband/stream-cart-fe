"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createQRPayment } from "@/services/api/payment/payment";
import { PaymentResponse } from "@/types/payment/payment";
import Image from "next/image";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
  IHttpConnectionOptions,
} from "@microsoft/signalr";

export default function OrderPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [qrData, setQrData] = useState<PaymentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    const ordersParam = searchParams.get("orders");
    if (!ordersParam) {
      setError("Không tìm thấy đơn hàng.");
      return;
    }

    const orderIds = ordersParam.split(",").map((id) => id.trim());

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

    // Setup SignalR for realtime payment status
    const baseUrl = process.env.NEXT_PUBLIC_SIGNALR_BASE_URL;
    const hubPath = "/paymentHub"; // adjust if backend differs
    if (!baseUrl) {
      console.warn(
        "Missing NEXT_PUBLIC_SIGNALR_BASE_URL for SignalR payment hub"
      );
      return;
    }

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const options: IHttpConnectionOptions = {
      accessTokenFactory: token ? () => token : undefined,
      withCredentials: false,
    };

    const connection = new HubConnectionBuilder()
      .withUrl(`${baseUrl}${hubPath}`, options)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (ctx) => {
          if (!ctx) return 1000;
          if (ctx.previousRetryCount < 5)
            return 1000 * (ctx.previousRetryCount + 1);
          return 10000;
        },
      })
      .configureLogging(LogLevel.Information)
      .build();

    connectionRef.current = connection;

    const start = async () => {
      try {
        await connection.start();
        // Join rooms for each order
        await Promise.all(
          orderIds.map((orderId) => connection.invoke("JoinOrderRoom", orderId))
        );

        // Listen for status updates
        connection.on(
          "PaymentStatusUpdated",
          (status: string, orderList: string) => {
            try {
              const target =
                status?.toLowerCase?.() === "success"
                  ? `/payment/order/results-success?orders=${orderList}`
                  : `/payment/order/results-failed?orders=${orderList}`;
              router.push(target);
            } catch (e) {
              console.error("Redirect error:", e);
            }
          }
        );
      } catch (e) {
        console.error("SignalR PaymentHub connection error:", e);
      }
    };

    start();

    return () => {
      try {
        connection.off("PaymentStatusUpdated");
      } catch {}
      connection
        .stop()
        .catch(() => {})
        .finally(() => {
          if (connectionRef.current === connection)
            connectionRef.current = null;
        });
    };
  }, [searchParams, router]);

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
            <p className="text-gray-600 mt-2">
              Vui lòng quét mã và thanh toán. Hệ thống sẽ tự động chuyển trang
              sau khi xác nhận.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
