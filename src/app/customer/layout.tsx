import { CartProvider } from "@/lib/CartContext";
import Navigation from "../(root)/components/Navigation";
import { Suspense } from "react";

export default async function LayoutCustomer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div>
        <div className="min-h-screen bg-[#F5F5F5]">
          <div className="fixed top-0 left-0 right-0  h-[8vh] w-full z-50">
            <Suspense fallback={null}>
              <Navigation />
            </Suspense>
          </div>
          <div className="flex flex-1 pt-[8vh] w-full  justify-center">
            <div className="w-full ">
              <Suspense fallback={null}>{children}</Suspense>
            </div>
          </div>
        </div>
      </div>
    </CartProvider>
  );
}
