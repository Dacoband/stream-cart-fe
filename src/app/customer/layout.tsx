import { CartProvider } from "@/lib/CartContext";
import Navigation from "../(root)/components/Navigation";

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
            <Navigation />
          </div>
          <div className="flex flex-1 pt-[8vh] w-full  justify-center">
            <div className="w-full ">{children}</div>
          </div>
        </div>
      </div>
    </CartProvider>
  );
}
