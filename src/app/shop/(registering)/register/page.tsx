"use client";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  RegisterSellerSchema,
  registerSellSchema,
} from "@/components/schema/register_shop";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { registerShop } from "@/services/api/shop/shop";
import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";
import { uploadImage } from "@/services/api/uploadImage";

function Page() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [descLength, setDescLength] = useState(0);
  const [logoError, setLogoError] = useState("");
  const [coverError, setCoverError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSellerSchema>({
    resolver: zodResolver(registerSellSchema),
  });

  const onSubmit = async (data: RegisterSellerSchema) => {
    setLoading(true);
    try {
      const logoInput = document.getElementById("logo") as HTMLInputElement;
      const coverInput = document.getElementById("cover") as HTMLInputElement;

      const logoFile = logoInput?.files?.[0];
      const coverFile = coverInput?.files?.[0];

      if (!logoFile) {
        setLogoError("Vui lòng chọn ảnh đại diện cửa hàng!");
      } else {
        setLogoError("");
      }

      if (!coverFile) {
        setCoverError("Vui lòng chọn ảnh bìa cửa hàng!");
      } else {
        setCoverError("");
      }

      if (!logoFile || !coverFile) {
        setLoading(false);
        return;
      }

      const logoUpload = await uploadImage(logoFile);
      const coverUpload = await uploadImage(coverFile);

      const logoURL = logoUpload.imageUrl;
      const coverImageURL = coverUpload.imageUrl;

      const response = await registerShop({
        shopName: data.shopName,
        description: data.description,
        logoURL,
        coverImageURL,
      });

      toast.success(response.data.data.message);
      router.push("/shop/registerAddress");
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      const message = err?.response?.data?.message || "Có lỗi xảy ra!";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardTitle className="text-2xl font-bold text-center text-gray-900">
        Thông tin cửa hàng
      </CardTitle>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full mx-auto">
          <div className="grid gap-6">
            {/* Tên shop */}
            <div className="grid gap-1.5">
              <Label
                htmlFor="shopName"
                className="text-black text-sm font-medium"
              >
                Tên cửa hàng
              </Label>
              <Input
                id="shopName"
                {...register("shopName")}
                className="bg-white text-black"
                placeholder="Nhập tên cửa hàng"
              />
              {errors.shopName && (
                <p className="text-red-500 text-xs mt-1 flex gap-2">
                  <TriangleAlert size={14} />
                  {errors.shopName.message}
                </p>
              )}
            </div>
            {/* Mô tả */}
            <div className="grid gap-1.5">
              <Label
                htmlFor="description"
                className="text-black text-sm font-medium"
              >
                Mô tả
              </Label>
              <textarea
                id="description"
                {...register("description")}
                maxLength={300}
                onChange={(e) => {
                  setDescLength(e.target.value.length);
                }}
                className="bg-white text-black border border-gray-300 rounded-md px-3 py-2 resize-none"
                placeholder="Nhập mô tả cửa hàng"
                rows={4}
              />
              <div className="text-right text-xs text-gray-500">
                {descLength}/300 ký tự
              </div>

              {errors.description && (
                <p className="text-red-500 text-xs mt-1 flex gap-2">
                  <TriangleAlert size={14} />
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Logo */}
            <div className="grid gap-3">
              <Label
                htmlFor="picture"
                className="text-black text-sm font-medium"
              >
                Ảnh đại diện cửa hàng:
              </Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                className="bg-white text-black cursor-pointer"
              />
              {logoError && (
                <p className="text-red-500 text-xs mt-1 flex gap-2">
                  <TriangleAlert size={14} />
                  {logoError}
                </p>
              )}
            </div>
            {/* Cover */}
            <div className="grid gap-3">
              <Label
                htmlFor="picture"
                className="text-black text-sm font-medium"
              >
                Ảnh bìa cửa hàng:
              </Label>
              <Input
                id="cover"
                type="file"
                accept="image/*"
                className="bg-white text-black cursor-pointer"
              />
              {coverError && (
                <p className="text-red-500 text-xs mt-1 flex gap-2">
                  <TriangleAlert size={14} />
                  {coverError}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-[#B0F847]  text-black hover:text-black/50 cursor-pointer"
              disabled={loading}
            >
              {loading ? "Đang đăng ký..." : "Đăng ký shop"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default Page;
