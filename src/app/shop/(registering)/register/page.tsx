"use client";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import React, { useEffect, useRef, useState } from "react";
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
import { Province, Ward } from "@/types/address/address";
import {
  getProvinces,
  getDistrict,
  getWard,
} from "@/services/api/address/listaddress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TriangleAlert,
  ImagePlus,
  CircleCheckBig,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { uploadImage } from "@/services/api/uploadImage";
import Image from "next/image";
import { useAuth } from "@/lib/AuthContext";
import SelectBank from "./components/SelectBank";
function Page() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>("");
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("");
  const [selectedWardId, setSelectedWardId] = useState<string>("");
  const { user } = useAuth();
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
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterSellerSchema>({
    resolver: zodResolver(registerSellSchema),
    defaultValues: {
      city: "",
      district: "",
      ward: "",
      bankName: "",
    },
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
      const response = await registerShop({
        shopName: data.shopName,
        description: data.description,
        logoURL,
        coverImageURL,
        street: data.street,
        ward: data.ward,
        district: data.district,
        city: data.city,
        country: "Việt Nam",
        postalCode: "7000",
        phoneNumber: user?.phoneNumber ?? "",
        bankName: data.bankName,
        tax: data.tax,
        bankNumber: data.bankNumber,
      });
      console.log("Register Shop success:", response);
      // localStorage.setItem("shopId", response.id);
      const shopId = response.id;
      const userDataStr = localStorage.getItem("userData");
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        userData.shopId = shopId;
        localStorage.setItem("userData", JSON.stringify(userData));
      }
      toast.success("Đơn đăng ký cửa hàng thành công");
      router.push("/shop/pending-register");
    } catch (error: unknown) {
      const err = error as AxiosError<{ error: string }>;
      const message = err?.response?.data?.error || "Có lỗi xảy ra!";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getProvinces().then((data) => {
      if (Array.isArray(data)) setProvinces(data);
      else setProvinces([]);
    });
  }, []);
  useEffect(() => {
    if (selectedProvinceId) {
      getDistrict(selectedProvinceId).then((data) => {
        if (Array.isArray(data)) setDistricts(data);
        else setDistricts([]);
        setSelectedDistrictId("");
        setWards([]);
        setSelectedWardId("");
      });
    } else {
      setDistricts([]);
      setSelectedDistrictId("");
      setWards([]);
      setSelectedWardId("");
    }
  }, [selectedProvinceId]);
  useEffect(() => {
    if (selectedDistrictId) {
      getWard(selectedDistrictId).then((data) => {
        if (Array.isArray(data)) setWards(data);
        else setWards([]);
        setSelectedWardId("");
      });
    } else {
      setWards([]);
      setSelectedWardId("");
    }
  }, [selectedDistrictId]);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full mx-auto">
      <Card className=" rounded-none">
        <CardTitle className="text-xl font-bold  text-gray-900 px-6 mb-5">
          Thông tin cửa hàng
        </CardTitle>
        <CardContent>
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
          </div>
        </CardContent>
      </Card>

      <Card className="mt-5 rounded-none">
        <CardTitle className="text-xl font-bold  text-gray-900 px-6 mb-5">
          Địa chỉ cửa hàng
        </CardTitle>
        <CardContent>
          <div className="grid gap-6">
            <div className=" grid grid-cols-3 gap-4">
              {/* Tỉnh/Thành phố */}
              <div>
                <Label
                  htmlFor="province"
                  className="text-black text-sm font-medium"
                >
                  Tỉnh / Thành phố *
                </Label>
                <Select
                  value={selectedProvinceId}
                  onValueChange={(value) => {
                    setSelectedProvinceId(value);
                    const provinceObj = provinces.find((p) => p.id === value);
                    setValue("city", provinceObj?.name || "");
                    setSelectedDistrictId("");
                    setSelectedWardId("");
                    setDistricts([]);
                    setWards([]);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn tỉnh/thành phố" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem key={province.id} value={province.id}>
                        {province.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {errors.city && (
                  <p className="text-red-500 text-xs mt-1 flex gap-2">
                    <TriangleAlert size={14} />
                    {errors.city.message}
                  </p>
                )}
              </div>
              {/* Quận/Huyện */}
              <div>
                <Label
                  htmlFor="district"
                  className="text-black text-sm font-medium"
                >
                  Quận / Huyện *
                </Label>
                <Select
                  value={selectedDistrictId}
                  onValueChange={(value) => {
                    setSelectedDistrictId(value);
                    const districtObj = districts.find((d) => d.id === value);
                    setValue("district", districtObj?.full_name || "");
                    setSelectedWardId("");
                    setWards([]);
                  }}
                  disabled={!selectedProvinceId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn quận/huyện" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {errors.district && (
                  <p className="text-red-500 text-xs mt-1 flex gap-2">
                    <TriangleAlert size={14} />
                    {errors.district.message}
                  </p>
                )}
              </div>
              {/* Phường/Xã */}
              <div>
                <Label
                  htmlFor="description"
                  className="text-black text-sm font-medium"
                >
                  Phường / Xã *
                </Label>
                <Select
                  value={selectedWardId}
                  onValueChange={(value) => {
                    setSelectedWardId(value);
                    const wardObj = wards.find((w) => w.id === value);
                    setValue("ward", wardObj?.full_name || "");
                  }}
                  disabled={!selectedDistrictId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn phường/xã" />
                  </SelectTrigger>
                  <SelectContent>
                    {wards.map((ward) => (
                      <SelectItem key={ward.id} value={ward.id}>
                        {ward.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {errors.ward && (
                  <p className="text-red-500 text-xs mt-1 flex gap-2">
                    <TriangleAlert size={14} />
                    {errors.ward.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label
                htmlFor="description"
                className="text-black text-sm font-medium"
              >
                Địa chỉ chi tiết *
              </Label>
              <textarea
                className="bg-white text-black border border-gray-300 w-full rounded-md px-3 py-2 resize-none"
                {...register("street")}
                placeholder="Số nhà, tên đường..."
                rows={4}
              />
              {errors.street && (
                <p className="text-red-500 text-xs mt-1 flex gap-2">
                  <TriangleAlert size={14} />
                  {errors.street.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-5 rounded-none">
        <CardTitle className="text-xl font-bold  text-gray-900 px-6 mb-5">
          Tài khoản ngân hàng liên kết
        </CardTitle>
        <CardContent>
          <div className="grid gap-6">
            <div>
              <SelectBank setValue={setValue} watch={watch} />
              {errors.bankName && (
                <p className="text-red-500 text-xs mt-1 flex gap-2">
                  <TriangleAlert size={14} />
                  {errors.bankName.message}
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label
                htmlFor="bankNumber"
                className="text-black text-sm font-medium"
              >
                Số tài khoản *
              </Label>
              <Input
                id="bankNumber"
                {...register("bankNumber")}
                className="bg-white text-black"
                placeholder="Nhập số tài khoản ngân hàng"
              />
              {errors.bankNumber && (
                <p className="text-red-500 text-xs mt-1 flex gap-2">
                  <TriangleAlert size={14} />
                  {errors.bankNumber.message}
                </p>
              )}
            </div>
            {/* Số tài khoản */}
            <div className="grid gap-1.5">
              <Label htmlFor="tax" className="text-black text-sm font-medium">
                Mã số thuế *
              </Label>
              <Input
                id="tax"
                {...register("tax")}
                className="bg-white text-black"
                placeholder="Nhập mã số thuế"
              />
              {errors.tax && (
                <p className="text-red-500 text-xs mt-1 flex gap-2">
                  <TriangleAlert size={14} />
                  {errors.tax.message}
                </p>
              )}
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-10">
            <div className="flex items-center space-x-4">
              <ShieldCheck className="w-10 h-10 text-blue-600 " />
              <div>
                <h4 className="font-medium text-blue-900">Cam kết bảo mật</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Thông tin của bạn được mã hóa và bảo mật tuyệt đối. StreamCart
                  cam kết không chia sẻ thông tin cá nhân với bên thứ ba.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-5">
            <Button
              type="submit"
              className="w-44 bg-[#B0F847] hover:bg-[#B0F847]/80  text-black hover:text-black/50 cursor-pointer"
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
                  Xác nhận đăng ký
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

export default Page;
