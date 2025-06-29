"use client";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import React, { useRef, useState } from "react";
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
import {
  TriangleAlert,
  ImagePlus,
  Shield,
  CircleCheckBig,
  Loader2,
} from "lucide-react";
import { uploadImage } from "@/services/api/uploadImage";
import Image from "next/image";

function Page() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [descLength, setDescLength] = useState(0);
  const [logoError, setLogoError] = useState("");
  const [coverError, setCoverError] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSellerSchema>({
    resolver: zodResolver(registerSellSchema),
  });

  const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
      setLogoError("");
    }
  };

  const onCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
      setCoverError("");
    }
  };

  const onSubmit = async (data: RegisterSellerSchema) => {
    setLoading(true);
    try {
      const logoInput = logoInputRef.current;
      const coverInput = coverInputRef.current;

      const logoFile = logoInput?.files?.[0];
      const coverFile = coverInput?.files?.[0];

      let hasError = false;
      if (!logoFile) {
        setLogoError("Vui lòng chọn ảnh đại diện cửa hàng!");
        hasError = true;
      } else {
        setLogoError("");
      }

      if (!coverFile) {
        setCoverError("Vui lòng chọn ảnh bìa cửa hàng!");
        hasError = true;
      } else {
        setCoverError("");
      }

      if (hasError) {
        setLoading(false);
        return;
      }

      const [logoUpload, coverUpload] = await Promise.all([
        uploadImage(logoFile as File),
        uploadImage(coverFile as File),
      ]);

      const logoURL = logoUpload.imageUrl;
      const coverImageURL = coverUpload.imageUrl;

      await registerShop({
        shopName: data.shopName,
        description: data.description,
        logoURL,
        coverImageURL,
      });

      toast.success("Đơn đăng ký cửa hàng thành công");
      router.push("/shop/registerAddress");
    } catch (error: unknown) {
      const err = error as AxiosError<{ error: string }>;
      const message = err?.response?.data?.error || "Có lỗi xảy ra!";
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
                Tên cửa hàng *
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
                Mô tả *
              </Label>
              <textarea
                id="description"
                {...register("description")}
                maxLength={300}
                onChange={(e) => setDescLength(e.target.value.length)}
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
            {/* Hình ảnh */}
            <div className="grid grid-cols-10 gap-16  items-end">
              <div className="col-span-3 flex flex-col gap-2 border-r">
                <Label className="text-black text-sm font-medium mb-2">
                  Ảnh đại diện cửa hàng *
                </Label>
                <div
                  className="relative w-44 h-44 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-lime-400 transition"
                  onClick={() => logoInputRef.current?.click()}
                >
                  {logoPreview ? (
                    <Image
                      src={logoPreview}
                      alt="Logo Preview"
                      fill
                      className="object-cover rounded-full"
                    />
                  ) : (
                    <ImagePlus className="w-10 h-10 text-gray-400" />
                  )}
                  <input
                    ref={logoInputRef}
                    id="logo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onLogoChange}
                  />
                </div>
                {logoError && (
                  <p className="text-red-500 text-xs mt-1 flex gap-2">
                    <TriangleAlert size={14} />
                    {logoError}
                  </p>
                )}
              </div>

              <div className="col-span-7 flex flex-col  gap-2">
                <Label className="text-black text-sm font-medium mb-2">
                  Ảnh bìa cửa hàng *
                </Label>
                <div
                  className="relative w-full h-44 rounded-md bg-gray-100 flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-lime-400 transition"
                  style={{ minWidth: 180 }}
                  onClick={() => coverInputRef.current?.click()}
                >
                  {coverPreview ? (
                    <Image
                      src={coverPreview}
                      alt="Cover Preview"
                      fill
                      className="object-fill rounded-md"
                    />
                  ) : (
                    <ImagePlus className="w-10 h-10 text-gray-400" />
                  )}
                  <input
                    ref={coverInputRef}
                    id="cover"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onCoverChange}
                  />
                </div>
                {coverError && (
                  <p className="text-red-500 text-xs mt-1 flex gap-2">
                    <TriangleAlert size={14} />
                    {coverError}
                  </p>
                )}
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-5">
              <div className="flex items-center space-x-4">
                <Shield className="w-10 h-10 text-blue-600 " />
                <div>
                  <h4 className="font-medium text-blue-900">Cam kết bảo mật</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Thông tin của bạn được mã hóa và bảo mật tuyệt đối.
                    StreamCart cam kết không chia sẻ thông tin cá nhân với bên
                    thứ ba.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                className="w-44 bg-[#B0F847]  text-black hover:text-black/50 cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" />
                    Đang đăng ký...
                  </>
                ) : (
                  <>
                    <CircleCheckBig className="mr-2" />
                    Tiếp tục đăng ký
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default Page;
