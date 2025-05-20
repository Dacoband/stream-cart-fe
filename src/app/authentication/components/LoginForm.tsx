// app/login/page.tsx
"use client";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginSchema } from "./schema";
import { useRouter } from "next/navigation";

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
    ];

    const user = fakeUsers.find(
      (u) => u.username === data.username && u.password === data.password
    );

    if (user) {
      const { username, role } = user;
      localStorage.setItem("user", JSON.stringify({ username, role }));

      if (role === "shop") {
        router.push("/shop/dashboard");
      } else {
        router.push("/");
      }
    } else {
      alert("Tên đăng nhập hoặc mật khẩu không đúng!");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 w-full mx-auto mt-10"
    >
      <div>
        <label htmlFor="username" className="block font-medium">
          Tên đăng nhập
        </label>
        <input
          id="username"
          {...register("username")}
          className="border border-gray-300 rounded w-full px-3 py-2"
        />
        {errors.username && (
          <p className="text-red-500 text-sm">{errors.username.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block font-medium">
          Mật khẩu
        </label>
        <input
          type="password"
          id="password"
          {...register("password")}
          className="border border-gray-300 rounded w-full px-3 py-2"
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" variant="default" className="cursor-pointer">
        Đăng nhập
      </Button>
    </form>
  );
}
