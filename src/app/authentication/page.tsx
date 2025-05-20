"use client";
import { useState } from "react";
import clsx from "clsx";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import { BiSolidShoppingBags } from "react-icons/bi";

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
          <div className="text-5xl font-medium">LOGIN</div>
          <div className="w-[70%]">
            <LoginForm />
          </div>
        </div>

        {/* Toggle Panel */}
        {/* bg-gradient-to-r from-indigo-500 to-teal-400 */}
        <div
          className={clsx(
            // Ẩn trên mobile, chỉ hiện trên lg trở lên
            "hidden lg:flex absolute top-0 left-1/2 w-1/2 h-full transition-all duration-500 ease-in-out z-40 rounded-l-[150px] bg-gradient-to-r from-white from-10% via-[#EAFFCD] via-20% to-[#CDFC7C] to-50%   text-blck flex-col items-center justify-center px-10 text-center",
            isSignUp ? "-translate-x-full rounded-r-[150px] rounded-l-none" : ""
          )}
        >
          {isSignUp ? (
            <>
              <h2 className="text-2xl font-bold">Chào bạn mới!</h2>
              <p className="text-sm mt-2">
                Đăng ký để trải nghiệm đầy đủ chức năng
              </p>
              <button
                onClick={() => setIsSignUp(false)}
                className="mt-4 border  text-black shadow-lg shadow-gray-800 px-6 py-2 bg-[#CDFC7C] rounded-full text-sm uppercase"
              >
                Đăng nhập
              </button>
            </>
          ) : (
            <>
              <h2 className="text-5xl font-bold flex gap-4">
                <BiSolidShoppingBags />
                Chào mừng bạn trở lại!
              </h2>
              <p className="text-sm mt-2">Đăng nhập để tiếp tục sử dụng</p>
              <button
                onClick={() => setIsSignUp(true)}
                className="mt-4 border  text-white font-semibold shadow-lg shadow-gray-800 px-10 py-2.5 bg-black rounded-full text-base uppercase"
              >
                Đăng ký
              </button>
              <div className="absolute top-0 right-[70%] text-[240px]">*</div>

              <div className="absolute top-5 right-[65%] text-[110px]">*</div>
              <div className="absolute bottom-0 right-14 text-[180px]">*</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
