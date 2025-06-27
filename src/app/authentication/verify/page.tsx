"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { verifyOtps, ReSendOtp } from "@/services/api/auth/authentication";
import { toast } from "sonner"; // hoặc react-toastify
import {
  ArrowLeft,
  Car,
  CreditCard,
  Mail,
  ShoppingCart,
  Store,
  TicketPercent,
} from "lucide-react";
import { AxiosError } from "axios";

function VerifyPage() {
  const [counter, setCounter] = useState(900); // 15 phút
  const [otpCode, setOtpCode] = useState(""); // lưu giá trị 6 số OTP
  const router = useRouter();

  // // Định dạng thời gian
  // const formatTime = (seconds: number) => {
  //   const m = Math.floor(seconds / 60)
  //     .toString()
  //     .padStart(2, "0");
  //   const s = (seconds % 60).toString().padStart(2, "0");
  //   return `${m}:${s}`;
  // };

  // Đếm ngược
  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.clear();
    router.push("/authentication/login");
  };
  useEffect(() => {
    if (counter <= 0) return;
    const timer = setInterval(() => setCounter((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [counter]);

  const handleVerify = async () => {
    const accountId = localStorage.getItem("accountId");
    if (!accountId || otpCode.length !== 6) {
      toast.error("Vui lòng nhập đầy đủ mã OTP");
      return;
    }

    try {
      const response = await verifyOtps(otpCode, accountId);

      toast.success(response.message);
      setTimeout(() => {
        toast.success("Vui lòng đăng nhập lại");
      }, 2000);
      router.push("/authentication/login");
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      const message = err?.response?.data?.message;
      toast.error(message);
      setOtpCode("");
    }
  };
  const handleResend = async () => {
    const accountId = localStorage.getItem("accountId");

    if (!accountId) {
      router.push("/authentication/login");
      toast.error("Đăng nhập để xác thực");
      return;
    }

    try {
      const response = await ReSendOtp(accountId);

      toast.success(response.message);
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      const message = err?.response?.data?.message;
      toast.error(message);
      setOtpCode("");
    }
  };
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
      <div className=" bg-white/40 w-[35%] h-[80%] z-20 flex flex-col items-center rounded-md p-5">
        <div className="flex flex-col justify-center items-center ">
          <Link href="/home">
            <div className=" mt-10 mb-2 cursor-pointer flex   rounded-md justify-center items-center ">
              <Image src="/logo2 .png" alt="Logo" width={80} height={80} />
            </div>
          </Link>
          <h1 className="text-white text-2xl font-bold mb-8">StreamCart</h1>
          <p className="  mb-2  flex gap-2 font-medium text-white text-center ">
            <Mail />
            Xác thực email
          </p>
          <div className="  mb-5 flex gap-2 flex-col justify-center text-white text-center text-sm">
            <p>Mã xác thực đã được gửi đến email của bạn.</p>
            <p>Vui lòng nhập mã OTP để tiếp tục.</p>
          </div>

          {/* <Link href="/authentication/register">
            <button className="mt-4 border text-black font-semibold shadow-lg cursor-pointer shadow-gray-800 px-10 py-2.5 bg-gradient-to-r from-[#B0F847] via-[#c6ef88] to-[#B0F847] rounded-full text-base uppercase animate-zoom-custom">
              Đăng ký
            </button>
          </Link> */}
        </div>

        <div className="mb-10 mt-10 mx-auto">
          <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="mx-2 border-2 text-2xl text-white rounded-md w-14 h-14"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <button
          onClick={handleVerify}
          className="mb-5 border text-black font-semibold font-sans shadow-lg cursor-pointer hover:text-gray-700 px-10 py-2.5 bg-gradient-to-r from-[#B0F847] via-[#c6ef88] to-[#B0F847] rounded-md w-full text-base "
        >
          Xác thực
        </button>

        <p className="text-white text-sm">
          Mã của bạn hoạt động trong vòng 15 phút
        </p>
        <button
          onClick={handleResend}
          className="text-[#B0F847] underline cursor-pointer hover:text-white transition-all mt-5"
        >
          Gửi lại mã
        </button>
        <button
          onClick={handleBack}
          className="bg-none mt-10 flex gap-2 text-base cursor-pointer"
        >
          <ArrowLeft /> Quay lại đăng nhập
        </button>
      </div>
    </div>
  );
}

export default VerifyPage;
