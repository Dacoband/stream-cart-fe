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
    <div className="flex items-center justify-center h-screen font-sans">
      <div className="w-full h-screen bg-white   overflow-hidden">
        {/* Toggle Button */}

        {/* Register Form */}
        <div
          className={clsx(
            "absolute top-0 w-1/2 h-full transition-all duration-500 ease-in-out z-10",
            isSignUp
              ? "translate-x-full opacity-100 pointer-events-auto z-50"
              : "opacity-0 pointer-events-none z-0"
          )}
        >
          <RegisterForm />
        </div>

        {/* Login Form */}
        <div
          className={clsx(
            "absolute top-0 left-0 w-1/2 h-screen transition-all duration-500 ease-in-out z-30 flex items-center justify-center flex-col",
            isSignUp
              ? "translate-x-full opacity-0 pointer-events-none"
              : "opacity-100 pointer-events-auto"
          )}
        >
          <div className="w-[70%] mt-6 pb-20">
            <LoginForm />
          </div>
        </div>

        {/* Toggle Panel */}
        {/* bg-gradient-to-r from-indigo-500 to-teal-400 */}
        <div
          className={clsx(
            // Ẩn trên mobile, chỉ hiện trên lg trở lên
            "hidden lg:flex absolute left-1/2 w-1/2 h-full transition-all duration-700 ease-in-out z-40 overflow-hidden",
            isSignUp ? "-translate-x-full" : ""
          )}
        >
          {/* Panel Animation & Branding */}
          <div className="w-full h-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
            <div className="z-10 flex flex-col items-center">
              {/* Logo */}
              <div className="w-36 h-36 mb-6">
                <Image src="/logo2 .png" alt="Logo" width={250} height={250} />
              </div>
              {/* Brand Name */}
              <h1 className="text-white text-4xl font-bold mb-8">StreamCart</h1>
              {/* Tagline */}
              <p className="text-gray-300 text-xl mb-12 text-center px-12">
                Bạn đã có tài khoản? Hãy đăng nhập để trãi nghiệm mua sắm
              </p>
              {/* Toggle Button */}

              <button
                onClick={() => setIsSignUp((prev) => !prev)}
                className="mt-4 border text-black font-semibold shadow-lg cursor-pointer shadow-gray-800 px-10 py-2.5 bg-gradient-to-r from-[#B0F847]  via-[#c6ef88]  to-[#B0F847] rounded-full text-base uppercase animate-zoom-custom"
              >
                {isSignUp ? "Đăng nhập" : "Đăng ký"}
              </button>
              {/* Enhanced Animation Elements */}
              <div className="mt-8 w-3/4 h-64 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fas fa-shopping-cart"></i>
                </div>
              </div>
            </div>
          </div>
          {/* Background Effect */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-400/20 to-transparent"></div>
            <div className="wave"></div>
            <div className="wave" style={{ animationDelay: "-4s" }}></div>
            <div className="floating-items">
              {(
                [
                  {
                    Icon: Store,
                    left: "32%",
                    top: "5%",
                    size: 42,
                    delay: "0s",
                  },
                  {
                    Icon: TicketPercent,
                    left: "6%",
                    top: "12%",
                    size: 50,
                    delay: "0s",
                  },
                  {
                    Icon: Car,
                    left: "72%",
                    top: "1%",
                    size: 52,
                    delay: "0.5s",
                  },
                  {
                    Icon: Car,
                    left: "60%",
                    top: "94%",
                    size: 52,
                    delay: "0.5s",
                  },
                  {
                    Icon: ShoppingCart,
                    left: "92%",
                    top: "12%",
                    size: 56,
                    delay: "1.5s",
                  },
                  {
                    Icon: ShoppingCart,
                    left: "90%",
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
                  {
                    Icon: Store,
                    left: "0%",
                    top: "50%",
                    size: 60,
                    delay: "2s",
                  },
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
                    left: "88%",
                    top: "35%",
                    size: 55,
                    delay: "4s",
                  },
                  {
                    Icon: Store,
                    left: "40%",
                    top: "80%",
                    size: 50,
                    delay: "4s",
                  },
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
        </div>
      </div>
    </div>
  );
}
