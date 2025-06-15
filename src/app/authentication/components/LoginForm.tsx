// app/login/page.tsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginSchema } from "./schema";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TriangleAlert } from "lucide-react";
export default function LoginForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginSchema) => {
    // Dữ liệu giả
    const fakeUsers = [
      { username: "shopUser", password: "password123", role: "shop" },
      { username: "normalUser", password: "password456", role: "user" },
      { username: "admin", password: "password456", role: "admin" },
    ];

    const user = fakeUsers.find(
      (u) => u.username === data.username && u.password === data.password
    );

    if (user) {
      const { username, role } = user;
      localStorage.setItem("user", JSON.stringify({ username, role }));

      if (role === "shop") {
        router.push("/shop");
      }
      if (role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/home");
      }
    } else {
      alert("Tên đăng nhập hoặc mật khẩu không đúng!");
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
          {/* Tên người dùng */}
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
            />
            {errors.username && (
              <p className="text-gray-300 text-xs mt-1 flex gap-2">
                <TriangleAlert size={14} />
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Mật khẩu */}
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
            <Input
              type="password"
              id="password"
              {...register("password")}
              className="bg-white text-black"
              placeholder="Nhập mật khẩu"
            />
            {errors.password && (
              <p className="text-gray-300 text-xs mt-1 flex gap-2">
                <TriangleAlert size={14} />
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r bg-[#B0F847]  text-black hover:text-white cursor-pointer"
          >
            Đăng nhập
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
        {/* <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <a href="#" className="underline underline-offset-4">
            Sign up
          </a>
        </div> */}
      </form>
    </div>
  );
}
