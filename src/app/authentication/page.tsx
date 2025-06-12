// }
"use client";
import { useState } from "react";
import clsx from "clsx";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Image from "next/image";
import {
  Store,
  ShoppingCart,
  Car,
  CreditCard,
  TicketPercent,
} from "lucide-react";

export default function LoginRegisterPage() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="relative flex items-center justify-center h-screen font-sans">
      {/* BG hiệu ứng phủ full screen */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-green-950" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-400/20 to-transparent" />
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

      {/* Các form nằm phía trên */}
      <div className="relative w-[80%] my-10 h-[80%] border rounded-2xl backdrop-blur-md shadow-lg bg-white/10 overflow-hidden z-10 flex items-center justify-center">
        {/* Khung tiêu đề và nút chuyển form */}
        <div className="w-1/2 h-full bg-white/30 rounded-r-[20%] flex flex-col justify-center px-10">
          <div className="flex flex-col items-center justify-between">
            <div className="w-36 h-36 mb-6">
              <Image src="/logo2 .png" alt="Logo" width={250} height={250} />
            </div>
            {/* Brand Name */}
            <h1 className="text-white text-4xl font-bold mb-8">StreamCart</h1>

            <p className="text-gray-300 text-xl mb-12 font-semibold text-center px-12 font-sans">
              {isSignUp
                ? "Bạn đã có tài khoản? Hãy đăng nhập để trãi nghiệm mua sắm tốt nhất."
                : "Bạn chưa có tài khoản? Hãy đăng ký để trãi nghiệm mua sắm tốt nhất."}
            </p>
            {/* Toggle Button */}

            <button
              onClick={() => setIsSignUp((prev) => !prev)}
              className="mt-4 border text-black font-semibold shadow-lg cursor-pointer shadow-gray-800 px-10 py-2.5 bg-gradient-to-r from-[#B0F847]  via-[#c6ef88]  to-[#B0F847] rounded-full text-base uppercase animate-zoom-custom"
            >
              {isSignUp ? "Đăng nhập" : "Đăng ký"}
            </button>
          </div>
        </div>
        <div className="w-1/2 h-full flex items-center justify-center relative">
          {/* Register Form */}
          <div
            className={clsx(
              "absolute left-0 top-0 w-full h-full flex items-center justify-center transition-all duration-500 ease-in-out z-20",
              isSignUp
                ? "translate-x-0 opacity-100 pointer-events-auto"
                : "translate-x-full opacity-0 pointer-events-none"
            )}
          >
            <div className="w-[80%] max-w-lg p-10">
              <RegisterForm />
            </div>
          </div>

          {/* Login Form */}
          <div
            className={clsx(
              "absolute left-0 top-0 w-full h-full flex items-center justify-center transition-all duration-500 ease-in-out z-30",
              isSignUp
                ? "-translate-x-[40%] opacity-0 pointer-events-none"
                : "translate-x-0 opacity-100 pointer-events-auto"
            )}
          >
            <div className="w-[80%] max-w-lg p-10 ">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
