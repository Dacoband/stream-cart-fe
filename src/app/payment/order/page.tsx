// "use client";

// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import { createQRPayment } from "@/services/api/payment/payment";
// import { PaymentResponse } from "@/types/payment/payment";
// import Image from "next/image";

// function Orderpage() {
//   const searchParams = useSearchParams();
//   const [qrData, setQrData] = useState<PaymentResponse | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);

//   useEffect(() => {
//     const ordersParam = searchParams.get("orders");
//     if (!ordersParam) {
//       setError("Không tìm thấy đơn hàng.");
//       return;
//     }

//     const orderIds = ordersParam.split(",").map((id) => id.trim());

//     setLoading(true);
//     createQRPayment(orderIds)
//       .then((res) => {
//         setQrData(res);
//         setError(null);
//       })
//       .catch((err) => {
//         console.error("Failed to create QR payment", err);
//         setError("Không thể tạo mã thanh toán. Vui lòng thử lại.");
//       })
//       .finally(() => setLoading(false));
//   }, [searchParams]);

//   return (
//     <div className="max-w-xl mx-auto px-4 py-8">
//       <h1 className="text-2xl font-bold mb-6 text-center">
//         Thanh toán đơn hàng
//       </h1>

//       {loading && (
//         <p className="text-center text-gray-500">
//           Đang tạo mã QR thanh toán...
//         </p>
//       )}

//       {error && <p className="text-center text-red-500 font-medium">{error}</p>}

//       {qrData && (
//         <div className="flex flex-col items-center gap-4 mt-6">
//           <Image
//             width={240}
//             height={240}
//             src={qrData.qrCode.split("|")[0]}
//             alt="QR Code Thanh Toán"
//             className="w-60 h-60 object-contain border p-2 rounded-lg"
//           />
//           <div className="text-center">
//             <p className="text-gray-600 text-sm mb-1">
//               <span className="font-medium">Mã thanh toán:</span>{" "}
//               {qrData.paymentId}
//             </p>
//             <p className="text-gray-600 text-sm mb-1">
//               <span className="font-medium">Nội dung chuyển khoản:</span>{" "}
//               {qrData.description}
//             </p>
//             <p className="text-green-600 text-lg font-semibold mt-2">
//               Tổng tiền: {qrData.totalAmount.toLocaleString("vi-VN")}đ
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Orderpage;
"use client";

import React, { Suspense } from "react";
import OrderPageContent from "../components/OrderPageContent";

export default function OrderPage() {
  return (
    <Suspense fallback={<p>Đang tải...</p>}>
      <OrderPageContent />
    </Suspense>
  );
}
