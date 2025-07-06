"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  RegisterSchema,
} from "../../../components/schema/auth_schema";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User, Store, TriangleAlert } from "lucide-react";
import { uploadImage } from "@/services/api/uploadImage";
import { register as registerApi } from "@/services/api/auth/authentication";
import { RegisterUser } from "@/types/auth/user";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
function RegisterForm() {
  const [role, setRole] = useState<"customer" | "shop">("customer");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      role: "customer",
    },
  });

  const onSubmit = async (data: RegisterSchema) => {
    try {
      let avatarURL = data.avatarUrl;

      const fileInput = document.getElementById("picture") as HTMLInputElement;
      const file = fileInput?.files?.[0];

      if (file) {
        const uploadRes = await uploadImage(file);
        avatarURL = uploadRes.imageUrl;
      }

      const payload: RegisterUser = {
        username: data.username,
        password: data.password,
        email: data.email,
        phoneNumber: data.phonenumber,
        fullname: data.fullName,
        avatarURL: avatarURL || "",
        role: data.role === "shop" ? 2 : 1,
      };

      const responseData = await registerApi(payload);
      console.log("Register success:", responseData.message);
      localStorage.setItem("accountId", responseData.data.id);
      toast.dismiss();
      toast.success(responseData.message);
      // setTimeout(() => {
      //   toast.success("Vui lòng đăng nhập lại");
      // }, 2000);
      router.push("/authentication/verify");
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      const message = err?.response?.data?.message || "Có lỗi đang xảy ra!";
      toast.error(message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const fullNameValue = watch("fullName");
  const emailValue = watch("email");
  const phoneValue = watch("phonenumber");

  return (
    <div className="flex w-full my-10 px-5 py-8 flex-col rounded-md">
      <div className="text-4xl font-bold text-center py-0 text-white">
        ĐĂNG KÝ
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full mx-auto">
        <div className="grid gap-6">
          {/* STEP 1 */}
          {step === 1 && (
            <>
              {/* Họ và tên */}
              <div className="grid gap-3 mb-1">
                <Label htmlFor="fullName" className="text-white">
                  * Họ và tên:
                </Label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  className="bg-white text-black"
                  placeholder="Nhập họ tên"
                />
                {errors.fullName && (
                  <p className="text-gray-300 text-xs flex gap-2">
                    <TriangleAlert size={14} />
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="grid gap-3 mb-1">
                <Label htmlFor="email" className="text-white">
                  * Email:
                </Label>
                <Input
                  id="email"
                  {...register("email")}
                  className="bg-white text-black"
                  placeholder="Nhập email"
                />
                {errors.email && (
                  <p className="text-gray-300 text-xs flex gap-2">
                    <TriangleAlert size={14} />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Số điện thoại */}
              <div className="grid gap-3 mb-1">
                <Label htmlFor="phonenumber" className="text-white">
                  * Số điện thoại:
                </Label>
                <Input
                  id="phonenumber"
                  {...register("phonenumber")}
                  className="bg-white text-black"
                  placeholder="Nhập số điện thoại"
                />
                {errors.phonenumber && (
                  <p className="text-gray-300 text-xs flex gap-2">
                    <TriangleAlert size={14} />
                    {errors.phonenumber.message}
                  </p>
                )}
              </div>

              <div className="grid gap-3 mt-1">
                <Label className="text-white">* Vai trò:</Label>
                <RadioGroup
                  value={role}
                  onValueChange={(val) => {
                    setRole(val as "customer" | "shop");
                    setValue("role", val);
                  }}
                  className="flex w-full gap-6"
                >
                  <label
                    htmlFor="customer"
                    className={`flex-1 flex flex-col items-center cursor-pointer px-6 py-4 rounded-xl border-2 transition font-medium ${
                      role === "customer"
                        ? "border-[#B0F847] bg-green-100/20 text-white"
                        : "border-white/20 bg-white/5 text-slate-300"
                    }`}
                  >
                    <RadioGroupItem
                      value="customer"
                      id="customer"
                      className="peer hidden"
                    />
                    <User className="mb-2" size={32} />
                    <span>Khách hàng</span>
                  </label>

                  <label
                    htmlFor="shop"
                    className={`flex-1 flex flex-col items-center cursor-pointer px-6 py-4 rounded-xl border-2 transition font-medium ${
                      role === "shop"
                        ? "border-[#B0F847] bg-green-100/20 text-white"
                        : "border-white/20 bg-white/5 text-slate-300"
                    }`}
                  >
                    <RadioGroupItem
                      value="shop"
                      id="shop"
                      className="peer hidden"
                    />
                    <Store className="mb-2" size={32} />
                    <span>Cửa hàng</span>
                  </label>
                </RadioGroup>
                {errors.role && (
                  <p className="text-red-500 text-sm">{errors.role.message}</p>
                )}
              </div>

              <Button
                type="button"
                className="mt-6 bg-gradient-to-r cursor-pointer from-[#B0F847] via-[#c6ef88] to-[#B0F847] text-black hover:text-white"
                onClick={() => setStep(2)}
                disabled={
                  !!errors.fullName ||
                  !!errors.email ||
                  !!errors.phonenumber ||
                  !!errors.role ||
                  !fullNameValue ||
                  !emailValue ||
                  !phoneValue
                }
              >
                Tiếp tục
              </Button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <div className="grid gap-3">
                <Label htmlFor="username" className="text-white">
                  Tên đăng nhập:
                </Label>
                <Input
                  id="username"
                  {...register("username")}
                  className="bg-white text-black"
                />
                {errors.username && (
                  <p className="text-gray-300 text-xs flex gap-2">
                    <TriangleAlert size={14} />
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="password" className="text-white">
                  Mật khẩu:
                </Label>
                <Input
                  type="password"
                  id="password"
                  {...register("password")}
                  className="bg-white text-black"
                />
                {errors.password && (
                  <p className="text-gray-300 text-xs flex gap-2">
                    <TriangleAlert size={14} />
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="confirmPassword" className="text-white">
                  Xác nhận mật khẩu:
                </Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  {...register("confirmPassword")}
                  className="bg-white text-black"
                />
                {errors.confirmPassword && (
                  <p className="text-gray-300 text-xs flex gap-2">
                    <TriangleAlert size={14} />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="picture" className="text-white">
                  Ảnh đại diện (không bắt buộc):
                </Label>
                <Input
                  id="picture"
                  type="file"
                  accept="image/*"
                  className="bg-white text-black cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                <Button
                  type="button"
                  onClick={() => setStep(1)}
                  className="cursor-pointer"
                >
                  Quay lại
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r cursor-pointer from-[#B0F847] via-[#c6ef88] to-[#B0F847] text-black hover:text-white"
                  disabled={loading}
                >
                  {loading ? "Đang đăng ký..." : "Đăng ký"}
                </Button>
              </div>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

export default RegisterForm;
