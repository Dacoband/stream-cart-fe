import {
  Store,
  ShoppingCart,
  Car,
  CreditCard,
  TicketPercent,
} from "lucide-react";

export default async function LayoutCustomer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex items-center justify-center h-screen w-full font-sans">
      {/* BG hiệu ứng phủ full screen */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gray-800" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-300/40 to-transparent" />
        <div className="wave"></div>
        <div className="wave" style={{ animationDelay: "-4s" }}></div>
        <div className="floating-items">
          {(
            [
              { Icon: Store, left: "32%", top: "5%", size: 42, delay: "0s" },
              {
                Icon: TicketPercent,
                left: "6%",
                top: "12%",
                size: 50,
                delay: "0s",
              },
              { Icon: Car, left: "72%", top: "1%", size: 52, delay: "0.5s" },
              { Icon: Car, left: "60%", top: "94%", size: 52, delay: "0.5s" },
              {
                Icon: ShoppingCart,
                left: "92%",
                top: "12%",
                size: 56,
                delay: "1.5s",
              },
              {
                Icon: ShoppingCart,
                left: "92%",
                top: "88%",
                size: 56,
                delay: "1.5s",
              },
              { Icon: Car, left: "14%", top: "75%", size: 52, delay: "1s" },
              {
                Icon: CreditCard,
                left: "75%",
                top: "75%",
                size: 44,
                delay: "1.5s",
              },
              { Icon: Store, left: "0%", top: "50%", size: 60, delay: "2s" },
              {
                Icon: ShoppingCart,
                left: "18%",
                top: "30%",
                size: 42,
                delay: "2.5s",
              },
              {
                Icon: CreditCard,
                left: "25%",
                top: "60%",
                size: 40,
                delay: "2.5s",
              },
              { Icon: Car, left: "77%", top: "52%", size: 54, delay: "3s" },
              {
                Icon: CreditCard,
                left: "68%",
                top: "22%",
                size: 38,
                delay: "3.5s",
              },
              {
                Icon: TicketPercent,
                left: "90%",
                top: "45%",
                size: 55,
                delay: "4s",
              },
              { Icon: Store, left: "40%", top: "80%", size: 50, delay: "4s" },
              {
                Icon: TicketPercent,
                left: "55%",
                top: "65%",
                size: 50,
                delay: "s",
              },
              {
                Icon: ShoppingCart,
                left: "5%",
                top: "92%",
                size: 46,
                delay: "2.5s",
              },
            ] as const
          ).map(({ Icon, left, top, size, delay }, idx) => (
            <div
              key={idx}
              className="floating-item text-green-400/20 glow-effect"
              style={{
                left,
                top,
                fontSize: size,
                animation: `float 10s ease-in-out infinite`,
                animationDelay: delay,
              }}
            >
              <Icon size={size} />
            </div>
          ))}
        </div>
      </div>

      <div className="relative w-[80%] my-10 h-[80%] border rounded-2xl backdrop-blur-md shadow-lg bg-white/10 overflow-hidden z-10 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
