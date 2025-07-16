import { CartProvider } from "@/lib/CartContext";
import Footer from "./components/Footer";
import Navigation from "./components/Navigation";

export default async function LayoutCustomer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div>
        <div className="min-h-screen bg-[#F5F5F5]">
          <div className="fixed top-0 left-0 right-0  h-20 w-full z-50">
            <Navigation />
          </div>
          <div className="flex flex-1 w-full pt-20 justify-center">
            <div className="w-full">{children}</div>
          </div>
        </div>
        <Footer />
      </div>
    </CartProvider>
  );
}
