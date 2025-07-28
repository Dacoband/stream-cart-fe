"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginSchema } from "@/components/schema/auth_schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TriangleAlert, Eye, EyeOff } from "lucide-react";
import { loginApi } from "@/services/api/auth/authentication";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/lib/AuthContext";
import { getMyShop } from "@/services/api/shop/shop";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/lib/CartContext";

export default function LoginForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { refreshCart } = useCart();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginSchema) => {
    setLoading(true);
    try {
      const response = await loginApi(data);
      const resData = response.data?.data;

      if (resData?.requiresVerification) {
        toast.info(response.data.message);
        router.push("/authentication/verify");
        return;
      }

      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("userData");

      if (!token || !userData) {
        throw new Error(
          "Không tìm thấy thông tin người dùng sau khi đăng nhập."
        );
      }

      const userInfor = JSON.parse(userData);
      const userWithToken = { ...userInfor, token };
      setUser(userWithToken);
      toast.success("Đăng nhập thành công!");

      switch (userInfor.role) {
        case 0:
        case 4:
          router.push("/admin/dashboard");
          break;
        case 1:
          router.push(redirect);
          await refreshCart();
          break;
        case 2:
          if (!userInfor.shopId) {
            router.push("/shop/register");
          } else {
            const shopRes = await getMyShop();

            const shop = Array.isArray(shopRes) ? shopRes[0] : shopRes;
            if (shop && shop.approvalStatus === "Approved") {
              router.push("/shop/dashboard");
            } else {
              router.push("/shop/pending-register");
            }
          }
          break;
        case 3:
          router.push("/partner/manageproduct");
          break;
        case 5:
          router.push("/manager/dashboard");
          break;
        default:
          console.log("Role không hợp lệ");
          router.push("/");
      }
    } catch (error: unknown) {
      let message = "Đăng nhập thất bại!";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full  my-20 px-5 py-8  flex-col rounded-md">
      <div className="text-4xl font-bold text-center py-0 text-white ">
        ĐĂNG NHẬP
      </div>
      <div className="text-lg font-medium text-center p-0 mb-14 mt-4 text-slate-200">
        Chào mừng bạn trở lại với <strong>Streame Card</strong>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full mx-auto">
        <div className="grid gap-6">
          <div className="grid gap-1.5">
            <Label
              htmlFor="username"
              className="text-white text-sm font-medium"
            >
              Tên người dùng
            </Label>
            <Input
              id="username"
              {...register("username")}
              className="bg-white text-black"
              placeholder="Nhập tên người dùng"
              autoComplete="username"
            />
            {errors.username && (
              <p className="text-gray-300 text-xs mt-1 flex gap-2">
                <TriangleAlert size={14} />
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <div className="flex justify-between items-center">
              <Label
                htmlFor="password"
                className="text-white text-sm font-medium"
              >
                Mật khẩu
              </Label>
              <a
                href="#"
                className="text-sm text-white underline-offset-4 hover:underline"
              >
                Quên mật khẩu?
              </a>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                {...register("password")}
                className="bg-white text-black pr-10"
                placeholder="Nhập mật khẩu"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={18} className="text-gray-500" />
                ) : (
                  <Eye size={18} className="text-gray-500" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-gray-300 text-xs mt-1 flex gap-2">
                <TriangleAlert size={14} />
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full  bg-gradient-to-r from-[#B0F847] via-[#c6ef88] to-[#B0F847]  text-black hover:text-black/50 cursor-pointer"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
          <div className="flex items-center gap-2 text-center text-sm my-4">
            <span className="flex-1 border-t border-white/30"></span>
            <span className="px-2 relative z-10 text-white">
              hoặc tiếp tục với
            </span>
            <span className="flex-1 border-t border-white/30"></span>
          </div>
          <Button variant="outline" className="w-full cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            Login with Google
          </Button>
        </div>
      </form>
    </div>
  );
}
