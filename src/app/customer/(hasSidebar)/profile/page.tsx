"use client";

import { Button } from "@/components/ui/button";
import {
  CameraIcon,
  Loader2,
  RotateCcwKeyIcon,
  Save,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { withRoleProtection } from "@/lib/requireRole";
import { uploadImage } from "@/services/api/uploadImage";
import { updateUserById } from "@/services/api/auth/account";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserUpdateSchema,
  userUpdateSchema,
} from "@/components/schema/account_schema";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import { AxiosError } from "axios";
import Image from "next/image";

function Profile() {
  const { user, refreshUser } = useAuth();
  const [avatarPreview, setAvartarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [loadingbt, setLoadingbt] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<UserUpdateSchema>({
    resolver: zodResolver(userUpdateSchema),
  });

  // Load thông tin user khi có
  useEffect(() => {
    if (user) {
      setValue("fullname", user.fullname || "");
      setValue("phoneNumber", user.phoneNumber || "");
      setAvartarPreview(user.avatarURL || null);
    }
  }, [user, setValue]);

  const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvartarPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: UserUpdateSchema) => {
    setLoadingbt(true);
    try {
      let avatarURL: string | null = null;
      const avatarFile = avatarInputRef.current?.files?.[0];

      if (avatarFile) {
        const avatarUpload = await uploadImage(avatarFile);
        avatarURL = avatarUpload.imageUrl;
      }

      if (!user?.id) {
        toast.error("Không tìm thấy thông tin người dùng!");
        setLoadingbt(false);
        return;
      }

      const response = await updateUserById(user.id, {
        phoneNumber: data.phoneNumber,
        fullname: data.fullname,
        avatarURL,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        shopId: user.shopId ?? null,
      });

      const shopId = response.id;
      const userDataStr = localStorage.getItem("userData");
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        userData.shopId = shopId;
        localStorage.setItem("userData", JSON.stringify(userData));
      }

      refreshUser();
      toast.success("Cập nhật thành công!");
    } catch (error: unknown) {
      console.error("Update user failed:", error);
      const err = error as AxiosError<{ error: string }>;
      const message = err?.response?.data?.error || "Cập nhật thất bại!";
      toast.error(message);
    } finally {
      setLoadingbt(false);
    }
  };

  return (
    <div className="flex flex-col py-8 px-10 bg-white">
      <div className="flex justify-between border-b pb-4">
        <div>
          <div className="text-xl font-semibold ">Hồ sơ của tôi:</div>
          <span className="text-muted-foreground text-sm ">
            Quản lý thông tin người dùng và điểm thưởng
          </span>
        </div>
        <Button className="bg-white text-black border-2 cursor-pointer hover:bg-gray-100">
          <RotateCcwKeyIcon /> Đổi mật khẩu
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full mx-auto mt-12">
        <div className=" flex ">
          {/* Avatar */}
          <div className=" flex flex-col justify-center gap-5 w-1/3 h-full border-r">
            <div className=" flex flex-col gap-2  w-full ">
              <Label className="text-black text-sm font-medium mb-2">
                Ảnh đại diện
              </Label>
              <div className="relative w-56 h-56 rounded-full bg-gray-100 border-2  border-gray-400 mx-auto">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Avatar"
                    fill
                    className="object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center  justify-center text-gray-400">
                    <UserRound className="w-20 h-20" />
                  </div>
                )}

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onLogoChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-black/70 rounded-full p-2 shadow cursor-pointer"
                >
                  <CameraIcon className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
            <span className="bg-purple-200 text-purple-700 px-4 py-2 text-sm rounded-full mx-auto font-medium w-fit">
              Điểm thưởng: 0
            </span>
          </div>
          <div className="w-2/3 ml-10">
            <h3 className="text-2xl font-medium text-gray-800 text-center mb-5">
              Thông tin cá nhân
            </h3>
            <div className="grid gap-5">
              {/* Họ và tên */}
              <div className="grid gap-1.5">
                <Label
                  htmlFor="fullname"
                  className="text-black text-sm font-medium"
                >
                  Họ và tên *
                </Label>
                <Input
                  id="fullname"
                  {...register("fullname")}
                  className="bg-white text-black"
                  placeholder="Nhập họ và tên"
                />
                {errors.fullname && (
                  <p className="text-red-500 text-xs mt-1 flex gap-2">
                    <TriangleAlert size={14} />
                    {errors.fullname.message}
                  </p>
                )}
              </div>

              {/* Số điện thoại */}
              <div className="grid gap-1.5">
                <Label
                  htmlFor="phoneNumber"
                  className="text-black text-sm font-medium"
                >
                  Số điện thoại *
                </Label>
                <Input
                  id="phoneNumber"
                  {...register("phoneNumber")}
                  className="bg-white text-black"
                  placeholder="Nhập số điện thoại"
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1 flex gap-2">
                    <TriangleAlert size={14} />
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label
                  htmlFor="userName"
                  className="text-black text-sm font-medium"
                >
                  Tên đăng nhập
                </Label>
                <Input
                  id="username"
                  className="bg-white text-black"
                  value={user?.username}
                  disabled
                />
              </div>
              <div className="grid gap-1.5">
                <Label
                  htmlFor="email"
                  className="text-black text-sm font-medium"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  className="bg-white text-black"
                  value={user?.email}
                  disabled
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-12">
          <Button
            type="submit"
            className="w-44 bg-[#B0F847] hover:bg-[#B0F847]/80 text-black hover:text-black/50 cursor-pointer"
            disabled={loadingbt}
          >
            {loadingbt ? (
              <>
                <Loader2 className="animate-spin mr-1" />
                Đang cập nhật...
              </>
            ) : (
              <>
                <Save className="mr-1" />
                Lưu thay đối
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default withRoleProtection(Profile, [1]);
