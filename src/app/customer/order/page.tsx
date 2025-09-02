import { Suspense } from "react";
import OrderPageInner from "./components/OrderPageInner";

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="p-4">Đang tải trang đặt hàng...</div>}>
      <OrderPageInner />
    </Suspense>
  );
}
