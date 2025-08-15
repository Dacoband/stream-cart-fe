"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createQRPayment } from "@/services/api/payment/payment";
import { PaymentResponse } from "@/types/payment/payment";
import Image from "next/image";

export default function OrderPageContent() {
  const searchParams = useSearchParams();
  const [qrData, setQrData] = useState<PaymentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

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
  }, [searchParams]);

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
