"use client";
import { useState } from "react";
import clsx from "clsx";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import { BiSolidShoppingBags } from "react-icons/bi";
import { FaAsterisk } from "react-icons/fa";
import Image from "next/image";
export default function LoginRegisterPage() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="flex items-center justify-center h-screen font-sans">
      <div className="w-full h-screen bg-white   overflow-hidden">
        {/* Register Form */}
        <div
          className={clsx(
            "absolute top-0 w-1/2 h-full transition-all duration-500 ease-in-out z-10",
            isSignUp
              ? "translate-x-full opacity-100 pointer-events-auto z-50"
              : "opacity-0 pointer-events-none z-0"
          )}
        >
          <Image src="/logo.png" alt="Logo" width={100} height={50} />
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
          <Image src="/logo.png" alt="Logo" width={180} height={100} />
          <div className="w-[70%] mt-6 pb-20">
            <LoginForm />
          </div>
        </div>

        {/* Toggle Panel */}
        {/* bg-gradient-to-r from-indigo-500 to-teal-400 */}
        <div
          className={clsx(
            // Ẩn trên mobile, chỉ hiện trên lg trở lên
            "hidden lg:flex absolute  left-1/2 w-1/2 h-full transition-all duration-700 ease-in-out z-40  bg-[#b5f546] text-black flex-col items-center justify-center px-10 text-center overflow-hidden",
            isSignUp ? "-translate-x-full " : ""
          )}
        >
          {isSignUp ? (
            <>
              <h2 className="text-4xl font-bold flex gap-4">
                <BiSolidShoppingBags />
                <div className="typing-effect">
                  STREAM CARD, xin chào bạn mới!
                </div>
              </h2>
              <p className="text-base mt-4 mb-8 font-medium">
                Nhấn đăng nhập nếu bạn đã có tài khoản
              </p>
              <button
                onClick={() => setIsSignUp(false)}
                className="mt-4 border  text-white font-semibold shadow-lg cursor-pointer shadow-gray-800 px-10 py-2.5  bg-black rounded-full text-base uppercase  animate-zoom-custom"
              >
                Đăng nhập
              </button>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-bold flex gap-4">
                <BiSolidShoppingBags />
                <div className="typing-effect">
                  Chào mừng bạn trở lại STREAM CARD!
                </div>
              </h2>
              <p className="text-base mt-4 mb-8 font-medium">
                Nhấn đăng ký nếu bạn chưa có tài khoản
              </p>
              <button
                onClick={() => setIsSignUp(true)}
                className="mt-4 border  text-white font-semibold shadow-lg cursor-pointer shadow-gray-800 px-10 py-2.5  bg-black rounded-full text-base uppercase  animate-zoom-custom"
              >
                Đăng ký
              </button>
            </>
          )}
          <div
            className="absolute top-10 right-[82%] text-[100px] leading-none animate-spin "
            style={{ animationDuration: "8s" }}
          >
            <FaAsterisk />
          </div>
          <div
            className="absolute top-24 right-[75%] text-[60px] leading-none transform animate-spin"
            style={{ animationDuration: "8s" }}
          >
            <FaAsterisk />
          </div>
          <div
            className="absolute bottom-10 right-12 text-[80px] animate-spin"
            style={{ animationDuration: "8s" }}
          >
            <FaAsterisk />
          </div>
        </div>
      </div>
    </div>
  );
}
