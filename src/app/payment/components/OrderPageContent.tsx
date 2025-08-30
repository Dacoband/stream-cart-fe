"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createQRPayment } from "@/services/api/payment/payment";
import { PaymentResponse } from "@/types/payment/payment";
import Image from "next/image";
import { getOrderById } from "@/services/api/order/order";
import { Order } from "@/types/order/order";
import { Card } from "@/components/ui/card";

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
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Thanh toán đơn hàng
          </h1>

          {loading && (
            <p className="text-center">Đang tạo mã QR thanh toán...</p>
          )}
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
        </Card>
      </div>
    </div>
  );
}

// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { createQRPayment } from "@/services/api/payment/payment";
// import { PaymentResponse } from "@/types/payment/payment";
// import Image from "next/image";
// import { getOrderById } from "@/services/api/order/order";
// import { Order } from "@/types/order/order";
// import { Card } from "@/components/ui/card";

// export default function OrderPageContent() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const [qrData, setQrData] = useState<PaymentResponse | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

//   const ordersParam = searchParams.get("orders") ?? "";
//   const orderIds = useMemo(
//     () =>
//       ordersParam
//         .split(",")
//         .map((id) => id.trim())
//         .filter(Boolean),
//     [ordersParam]
//   );
//   const firstOrderId = orderIds[0];

//   useEffect(() => {
//     if (!ordersParam) {
//       setError("Không tìm thấy đơn hàng.");
//       return;
//     }

//     setLoading(true);
//     createQRPayment(orderIds)
//       .then((res) => {
//         setQrData(res);
//         setError(null);
//       })
//       .catch(() => {
//         setError("Không thể tạo mã thanh toán. Vui lòng thử lại.");
//       })
//       .finally(() => setLoading(false));
//   }, [ordersParam, orderIds]);

//   // Poll payment status
//   useEffect(() => {
//     if (!firstOrderId) return;

//     const poll = async () => {
//       try {
//         const res = await getOrderById(firstOrderId);
//         const order: Order = res?.data ?? res;
//         const status = Number(order?.paymentStatus ?? 0);
//         if (status === 1) {
//           router.push(
//             `/payment/order/results-success?orders=${encodeURIComponent(
//               ordersParam
//             )}`
//           );
//           return;
//         }
//         if (status !== 0) {
//           router.push(
//             `/payment/order/results-failed?orders=${encodeURIComponent(
//               ordersParam
//             )}`
//           );
//           return;
//         }
//       } catch (e) {
//         console.warn("Polling payment status failed", e);
//       }
//     };

//     pollTimerRef.current = setInterval(poll, 5000);

//     return () => {
//       if (pollTimerRef.current) clearInterval(pollTimerRef.current);
//       pollTimerRef.current = null;
//     };
//   }, [firstOrderId, ordersParam, router]);

//   return (
//     <div className="relative min-h-screen w-full bg-black flex items-center justify-center px-4 py-8 overflow-hidden">
//       {/* Background Gradient */}
//       <div className="absolute inset-0">
//         <div
//           className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-30 blur-3xl"
//           style={{
//             background: `radial-gradient(circle, #B0F847 0%, #B0F847 30%, transparent 70%)`,
//           }}
//         />
//         <div
//           className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full opacity-20 blur-2xl"
//           style={{
//             background: `radial-gradient(circle, #B0F847 0%, #B0F847 40%, transparent 80%)`,
//           }}
//         />
//         <div
//           className="absolute bottom-1/3 left-1/4 w-48 h-48 rounded-full opacity-25 blur-xl"
//           style={{
//             background: `radial-gradient(circle, #B0F847 0%, #B0F847 50%, #B0F847 20%, transparent 90%)`,
//           }}
//         />
//         <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
//       </div>

//       {/* Nội dung chính */}
//       <div className="relative z-10 max-w-xl w-full">
//         <Card className="p-6">
//           <h1 className="text-2xl font-bold mb-6 text-center">
//             Thanh toán đơn hàng
//           </h1>

//           {/* chỉ loading trong card */}
//           {loading ? (
//             <p className="text-center text-gray-500">
//               Đang tạo mã QR thanh toán...
//             </p>
//           ) : error ? (
//             <p className="text-center text-red-500">{error}</p>
//           ) : qrData ? (
//             <div className="flex flex-col items-center gap-4 mt-6">
//               <Image
//                 width={288}
//                 height={288}
//                 src={qrData.qrCode.split("|")[0]}
//                 alt="QR Code Thanh Toán"
//                 className="w-72 h-72 object-contain border p-2 rounded-lg"
//               />
//               <div className="text-center">
//                 <p>
//                   <span className="font-medium">Mã thanh toán:</span>{" "}
//                   {qrData.paymentId}
//                 </p>
//                 <p>
//                   <span className="font-medium">Nội dung chuyển khoản:</span>{" "}
//                   {qrData.description}
//                 </p>
//                 <p className="text-green-600 font-semibold">
//                   Tổng tiền: {qrData.totalAmount.toLocaleString("vi-VN")}đ
//                 </p>
//               </div>
//             </div>
//           ) : null}
//         </Card>
//       </div>
//     </div>
//   );
// }
