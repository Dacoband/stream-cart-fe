import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterSchema } from "./schema";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User, Store as StoreIcon, TriangleAlert } from "lucide-react";

function RegisterForm() {
  const [role, setRole] = useState<"customer" | "shop">("customer");
  const [step, setStep] = useState(1);

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

  const onSubmit = (data: RegisterSchema) => {
    console.log("Đăng ký:", data);
  };

  const fullNameValue = watch("fullName");
  const emailValue = watch("email");
  const phoneValue = watch("phonenumber");

  return (
    <div className="flex w-full my-10 px-5 py-8 flex-col rounded-md">
      <div className="text-4xl font-bold text-center py-0 text-white ">
        ĐĂNG KÝ
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full mx-auto">
        <div className="grid gap-6">
          {/* STEP 1 */}
          {step === 1 && (
            <>
              <div className="grid gap-3 mb-1">
                <Label htmlFor="fullName" className="text-white">
                  * Họ và tên:
                </Label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  className="bg-white text-black"
                  placeholder="Nhập tên người dùng"
                />
                {errors.fullName && (
                  <p className="text-gray-300 text-xs flex gap-2">
                    <TriangleAlert size={14} />
                    {errors.fullName.message}
                  </p>
                )}
              </div>
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
                <Label className="text-white">* Đăng ký với vai trò:</Label>
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
                    className={`flex-1  flex flex-col items-center cursor-pointer px-6 py-4 rounded-xl border-2 transition font-medium
                      ${
                        role === "customer"
                          ? "border-[#B0F847] bg-green-100/20 text-white"
                          : "border-white/20 bg-white/5 text-slate-300"
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
                    className={`flex-1  flex flex-col items-center cursor-pointer px-6 py-4 rounded-xl border-2 transition
                      ${
                        role === "shop"
                          ? "border-[#B0F847] bg-green-100/20 text-white"
                          : "border-white/20 bg-white/5 text-slate-300"
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
              </div>
              <Button
                type="button"
                className="mt-6 cursor-pointer bg-[#B0F847] text-black  hover:text-white  {
                  
                }"
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
                  className="text-white"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm">
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
                  <p className="text-red-500 text-sm">
                    <TriangleAlert className="inline mr-1" size={16} />
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
                  Đăng ký
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
