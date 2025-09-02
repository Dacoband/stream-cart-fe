import { Suspense } from "react";
import CartPageInner from "./components/CartPageInner";

export default function Page() {
  return (
    <Suspense>
      <CartPageInner />
    </Suspense>
  );
}
