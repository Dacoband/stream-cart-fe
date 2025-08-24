"use client";
import {
  CameraIcon,
  CheckCircle,
  CirclePlus,
  Eye,
  EyeClosed,
  UserRound,
} from "lucide-react";
import React, { useRef } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateModeratorSchema,
  createModeratorSchema,
} from "@/components/schema/moderator_schema";
import { createModerator } from "@/services/api/auth/moderator";
import { uploadImage } from "@/services/api/uploadImage";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface DialogCreate {
  onSuccess?: () => void;
}

const DialogCreateModerator = ({ onSuccess }: DialogCreate) => {
  const [open, setOpen] = useState(false);
  const [avatarPreview, setAvartarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [loadingbt, setLoadingbt] = useState(false);
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<CreateModeratorSchema>({
    resolver: zodResolver(createModeratorSchema),
    defaultValues: {},
  });

  const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvartarPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: CreateModeratorSchema) => {
    setLoadingbt(true);
    try {
      let avatarURL: string | null = null;
      const avatarFile = avatarInputRef.current?.files?.[0];

      if (avatarFile) {
        const avatarUpload = await uploadImage(avatarFile);
        avatarURL = avatarUpload.imageUrl;
      }
      if (!user?.id) {
        setLoadingbt(false);
        return;
      }
      await createModerator(user.shopId, {
        username: data.username,
        fullname: data.fullname,
        avatarURL,
        password: data.password,
        phoneNumber: data.phoneNumber,
        email: data.email,
      });
      setOpen(false);
      toast.success("Thêm nhân viên mới thành công!");
      if (onSuccess) onSuccess();
      form.reset();
      setAvartarPreview(null);
    } catch (error: unknown) {
      console.error("Create user failed:", error);
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
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            form.reset();
            setAvartarPreview(null);
          }
        }}
      >
        <DialogTrigger className="bg-[#B0F847] text-black shadow flex gap-2   py-3 font-medium px-4 rounded-md h-fit  items-center cursor-pointer hover:bg-[#B0F847]/80 hover:text-black/80">
          <CirclePlus size={18} /> Thêm nhân viên
        </DialogTrigger>
        <DialogContent className=" m-0  max-h-[78vh] overflow-auto">
          <DialogHeader className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#B0F847] rounded-lg flex items-center justify-center">
                <UserRound className="w-5 h-5 text-black" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  Tạo thông tin nhân viên
                </DialogTitle>
                <DialogDescription className="text-gray-500">
                  Tạo mới thông tin nhân viên trong hệ thống
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
              <div className="space-y-5 mt-5">
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
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên đăng nhập *</FormLabel>
                        <FormControl>
                          <Input
                            id="username"
                            className="bg-white text-black"
                            placeholder="Nhập tên đăng nhập"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email*</FormLabel>
                        <FormControl>
                          <Input
                            id="email"
                            className="bg-white text-black"
                            placeholder="Nhập email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  {/*Passwword */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mật khẩu *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              className="bg-white text-black pr-10"
                              placeholder="Nhập mật khẩu"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((prev) => !prev)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500"
                            >
                              {showPassword ? <Eye /> : <EyeClosed />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Xác nhận mật khẩu *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={"password"}
                              className="bg-white text-black pr-10"
                              placeholder="Nhập lại mật khẩu"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <DialogFooter>
                <div className="flex w-full justify-end gap-5 border-t pt-5 mt-8">
                  <DialogClose
                    onClick={() => {
                      form.reset();
                      setAvartarPreview(null);
                    }}
                    className="px-5 border  text-black hover:text-black/80 cursor-pointer rounded-md"
                  >
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
                        Đang thêm nhân viên...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-1" />
                        Tạo nhân viên
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

export default DialogCreateModerator;
