import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  RegisterSchema,
  registerSellSchema,
  RegisterSellerSchema,
} from "./schema";
import type { z } from "zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { User, Store as StoreIcon, TriangleAlert } from "lucide-react";
import RegisterShopForm from "./RegisterShopForm";

function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState<"customer" | "shop">("customer");
  const [step, setStep] = useState(1);

  // Form cho user
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    watch,
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });

  // Form cho shop
  type RegisterShopSchema = z.infer<typeof registerSellSchema>;
  const {
    register: shopRegister,
    handleSubmit: shopHandleSubmit,
    formState: { errors: shopErrors },
  } = useForm<RegisterShopSchema>({
    resolver: zodResolver(registerSellSchema),
    mode: "onTouched",
  });

  // Submit cho user (step 2)
  const onSubmitUser = (data: RegisterSchema) => {
    if (role === "customer") {
      // Gọi API đăng ký customer
      console.log("Đăng ký customer thành công:", data);
    } else {
      setStep(3); // Sang bước shop
    }
  };

  // Submit cho shop (step 3)
  const onSubmitShop = (shopData: RegisterSellerSchema) => {
    // Lấy dữ liệu user từ form chính
    const userData = getValues();
    // Gộp dữ liệu user + shop
    const finalData = { ...userData, ...shopData };
    // Gọi API đăng ký shop
    console.log("Đăng ký shop thành công:", finalData);
  };

  return (
    <div className="flex w-full my-10 px-5 py-8 flex-col rounded-md">
      <div className="text-4xl font-bold text-center py-0 text-white ">
        ĐĂNG KÝ
      </div>
      <div className="text-lg font-medium text-center p-0 mb-8 mt-4 text-slate-200">
        Chào mừng bạn đến với <strong>StreamCart</strong>
      </div>
      {/* STEP 1 & 2 dùng form user */}
      <form onSubmit={handleSubmit(onSubmitUser)} className="w-full mx-auto">
        <div className="grid gap-6">
          {/* STEP 1: Họ tên, username, chọn role */}
          {step === 1 && (
            <div className="grid gap-3">
              <Label htmlFor="fullname" className="text-white">
                Họ và tên:
              </Label>
              <Input
                id="fullName"
                {...register("fullName")}
                className="text-white"
              />
              {errors.fullName && (
                <p className="text-slate-100 text-sm">
                  {errors.fullName.message}
                </p>
              )}
              <Label htmlFor="email" className="text-white">
                Email:
              </Label>
              <Input id="email" {...register("email")} />
              {errors.email && (
                <p className="text-slate-100 text-sm">{errors.email.message}</p>
              )}
              <div className="grid gap-3">
                <Label htmlFor="phonenumber" className="text-white">
                  Số điện thoại:
                </Label>
                <Input id="phonenumber" {...register("phonenumber")} />
                {errors.phonenumber && (
                  <p className="text-red-500 text-sm">
                    {errors.phonenumber.message}
                  </p>
                )}
              </div>
              <Label className="text-white mt-4">Đăng ký với vai trò:</Label>
              <RadioGroup
                value={role}
                onValueChange={(val) => {
                  setRole(val as "customer" | "shop");
                  setValue("role", val);
                }}
                className="flex w-full justify-between"
              >
                <label
                  htmlFor="customer"
                  className={`flex-1 w-[45%] flex flex-col items-center cursor-pointer px-6 py-4 rounded-xl border-2 transition
                    ${
                      role === "customer"
                        ? "border-green-400 bg-green-100/20 text-white"
                        : "border-white/20 bg-white/5 hover:border-green-300"
                    }
                  `}
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
                  className={`flex-1 w-[45%] flex flex-col items-center cursor-pointer px-6 py-4 rounded-xl border-2 transition
                    ${
                      role === "shop"
                        ? "border-green-400 bg-green-100/20 text-white"
                        : "border-white/20 bg-white/5 hover:border-green-300"
                    }
                  `}
                >
                  <RadioGroupItem
                    value="shop"
                    id="shop"
                    className="peer hidden"
                  />
                  <StoreIcon className="mb-2" size={32} />
                  <span>Cửa hàng</span>
                </label>
              </RadioGroup>
              {errors.role && (
                <p className="text-red-500 text-sm">{errors.role.message}</p>
              )}
              <Button
                type="button"
                className="mt-10 cursor-pointer"
                disabled={
                  !!errors.role ||
                  !!errors.fullName ||
                  !!errors.email ||
                  !!errors.phonenumber
                }
                onClick={() => setStep(2)}
              >
                Tiếp tục
              </Button>
            </div>
          )}

          {/* STEP 2: Thông tin chung */}
          {step === 2 && (
            <>
              <div className="grid gap-3">
                <Label htmlFor="username" className="text-white mt-4">
                  Tên đăng nhập:
                </Label>
                <Input
                  id="username"
                  {...register("username")}
                  className="text-white"
                />
                {errors.username && (
                  <p className="text-slate-100 text-sm">
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
                />
                {errors.password && (
                  <p className="text-slate-100 text-sm">
                    <TriangleAlert />
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
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* AvatarUrl chỉ cho phép nhập nếu muốn */}
              <div className="grid gap-3">
                <Label htmlFor="avatarUrl" className="text-white">
                  Ảnh đại diện (URL){" "}
                  <span className="text-xs text-gray-400">
                    (không bắt buộc)
                  </span>
                </Label>
                <Input id="avatarUrl" {...register("avatarUrl")} />
                {errors.avatarUrl && (
                  <p className="text-red-500 text-sm">
                    {errors.avatarUrl.message}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" onClick={() => setStep(1)}>
                  Quay lại
                </Button>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r bg-[#B0F847] text-black hover:text-white cursor-pointer"
                >
                  {role === "shop" ? "Tiếp tục" : "Đăng ký"}
                </Button>
              </div>
            </>
          )}
        </div>
      </form>

      {/* STEP 3: Form riêng cho shop */}
      {step === 3 && role === "shop" && (
        <RegisterShopForm
          register={shopRegister}
          errors={shopErrors}
          onBack={() => setStep(2)}
          onSubmit={onSubmitShop}
          handleSubmit={shopHandleSubmit}
        />
      )}
    </div>
  );
}

export default RegisterForm;
