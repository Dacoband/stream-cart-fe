"use client";
import { CameraIcon, CheckCircle, UserRound } from "lucide-react";
import React, { useRef } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserUpdateSchema,
  userUpdateSchema,
} from "@/components/schema/account_schema";
import { uploadImage } from "@/services/api/uploadImage";

import { toast } from "sonner";
import { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Moderator } from "@/types/auth/user";
import { updateUserById } from "@/services/api/auth/account";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DialogTitle } from "@radix-ui/react-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
interface DialogUpdate {
  onSuccess?: () => void;
  moderator: Moderator | null;
  open?: boolean;
  onClose?: () => void;
}

const DialogUpdateModerator = ({
  onSuccess,
  moderator,
  open,
  onClose,
}: DialogUpdate) => {
  const [avatarPreview, setAvartarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [loadingbt, setLoadingbt] = useState(false);
  const [isActive, setIsActive] = useState(moderator?.isActive ?? true);

  const form = useForm<UserUpdateSchema>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      fullname: moderator?.fullname || "",
      phoneNumber: moderator?.phoneNumber || "",
    },
  });

  useEffect(() => {
    if (moderator && open) {
      form.reset({
        fullname: moderator.fullname || "",
        phoneNumber: moderator.phoneNumber || "",
      });
      setAvartarPreview(moderator.avatarURL || null);
    }
    // eslint-disable-next-line
  }, [moderator, open]);

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
      if (!moderator?.id) {
        setLoadingbt(false);
        return;
      }
      const response = await updateUserById(moderator.id, {
        phoneNumber: data.phoneNumber,
        fullname: data.fullname,
        avatarURL,
        role: 3,
        isActive: isActive,
        isVerified: moderator?.isVerified,
        shopId: moderator?.shopId ?? null,
      });

      const shopId = response.id;
      const userDataStr = localStorage.getItem("userData");
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        userData.shopId = shopId;
        localStorage.setItem("userData", JSON.stringify(userData));
      }

      toast.success("Cập nhật thành công!");
      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      console.error("Update user failed:", error);
      const err = error as AxiosError<{ message?: string; errors?: string[] }>;
      const message =
        err?.response?.data?.errors?.[0] ||
        err?.response?.data?.message ||
        "Cập nhật thất bại!";
      toast.error(message);
    } finally {
      setLoadingbt(false);
    }
  };

  return (
    <div className="w-fix">
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className=" m-0 py-5 max-h-[78vh] overflow-auto">
          <DialogHeader className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#B0F847] rounded-lg flex items-center justify-center">
                <UserRound className="w-5 h-5 text-black" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  Cập nhật thông tin nhân viên
                </DialogTitle>
                <DialogDescription className="text-gray-500">
                  Chỉnh sửa thông tin nhân viên trong hệ thống
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full mx-auto"
            >
              <div className="w-full h-fit bg-gray-100 py-4">
                <div className="relative w-32 h-32 rounded-full bg-gray-100 border-2 border-gray-400 mx-auto">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Avatar"
                      fill
                      className="object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <UserRound className="w-12 h-12" />
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
                    className="absolute bottom-1 right-1 bg-black/70 rounded-full p-2 shadow cursor-pointer"
                  >
                    <CameraIcon className="w-4 h-4 text-white" />
                  </button>
                </div>

                <Label className="text-black text-sm font-medium mt-2 w-full flex justify-center">
                  Ảnh đại diện
                </Label>
                <span className="text-gray-600 text-sm  w-full flex justify-center">
                  Nên chọn tỉ lệ 1:1{" "}
                </span>
              </div>
              <div className="grid gap-8 mt-5">
                <div className="grid grid-cols-2 gap-5">
                  {/* Họ và tên */}
                  <FormField
                    control={form.control}
                    name="fullname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ và tên *</FormLabel>
                        <FormControl>
                          <Input
                            id="fullname"
                            className="bg-white text-black"
                            placeholder="Nhập họ và tên"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Tên đăng nhập */}
                  <FormItem>
                    <FormLabel>Tên đăng nhập</FormLabel>
                    <FormControl>
                      <Input
                        id="username"
                        className="bg-white text-black"
                        value={moderator?.username || ""}
                        disabled
                      />
                    </FormControl>
                  </FormItem>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  {/* Số điện thoại */}
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số điện thoại *</FormLabel>
                        <FormControl>
                          <Input
                            id="phoneNumber"
                            className="bg-white text-black"
                            placeholder="Nhập số điện thoại"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        className="bg-white text-black"
                        value={moderator?.email || ""}
                        disabled
                      />
                    </FormControl>
                  </FormItem>
                </div>
                <div className="space-y-2">
                  <FormLabel>Trạng thái hoạt động của tài khoản</FormLabel>
                  <Select
                    value={isActive ? "true" : "false"}
                    onValueChange={(value) => setIsActive(value === "true")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-green-500" />
                          Hoạt động
                        </div>
                      </SelectItem>
                      <SelectItem value="false">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-red-500" />
                          Ngừng hoạt động
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <div className="flex w-full justify-end gap-5 border-t pt-5 mt-10">
                  <DialogClose className="px-5 border  text-black hover:text-black/80 cursor-pointer rounded-md">
                    <>Thoát</>
                  </DialogClose>

                  <Button
                    type="submit"
                    className="px-8 bg-[#B0F847] hover:bg-[#B0F847]/80 text-black hover:text-black/50 cursor-pointer"
                    disabled={loadingbt}
                  >
                    {loadingbt ? (
                      <>
                        <Loader2 className="animate-spin mr-1" />
                        Đang cập nhật...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-1" />
                        Lưu thay đổi
                      </>
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DialogUpdateModerator;
