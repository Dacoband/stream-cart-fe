"use client";
import { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerAddress,
  AddressSchema,
} from "@/components/schema/address_schema";
import { CreateAddress } from "@/types/address/address";
import { CreateAddresses } from "@/services/api/address/address";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { Input } from "@/components/ui/input";
import { CircleCheckBig, Loader2, TriangleAlert } from "lucide-react";
import { Province, Ward } from "@/types/address/address";
import { Label } from "@/components/ui/label";

function FromAddress() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>("");
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("");
  const [selectedWardId, setSelectedWardId] = useState<string>("");
  const selectedWardObj = wards.find((w) => w.id === selectedWardId);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddressSchema>({
    resolver: zodResolver(registerAddress),
  });
  const onSubmit = async (data: AddressSchema) => {
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const shopId = userData.shopId || localStorage.getItem("shopId") || "";

      const payload: CreateAddress = {
        recipientName: data.recipientName,
        street: data.street,
        ward: data.ward,
        district: data.district,
        city: data.city,
        country: "Việt Nam",
        postalCode: "7000",
        phoneNumber: data.phonenumber,
        isDefaultShipping: true,
        latitude: selectedWardObj?.latitude
          ? Number(selectedWardObj.latitude)
          : 0,
        longitude: selectedWardObj?.longitude
          ? Number(selectedWardObj.longitude)
          : 0,
        type: 1,
        shopId: shopId,
      };
      console.log(payload);
      const responseData = await CreateAddresses(payload);

      toast.dismiss();
      toast.success(responseData.message);
      router.push("/shop/pending-register");
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      const message = err?.response?.data?.message || "Có lỗi xảy ra!";
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto mt-6 space-y-6 px-4"
    >
      <div className=" grid grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor="description"
            className="text-black text-sm font-medium"
          >
            Tên người nhận
          </Label>
          <Input
            {...register("recipientName")}
            placeholder="Nhập tên người nhận"
          />
          {errors.recipientName && (
            <p className="text-red-500 text-xs mt-1 flex gap-2">
              <TriangleAlert size={14} />
              {errors.recipientName.message}
            </p>
          )}
        </div>

        <div>
          <Label
            htmlFor="phonenumber"
            className="text-black text-sm font-medium"
          >
            Số điện thoại
          </Label>
          <Input
            {...register("phonenumber")}
            placeholder="Nhập số điện thoại"
          />
          {errors.phonenumber && (
            <p className="text-red-500 text-xs mt-1 flex gap-2">
              <TriangleAlert size={14} />
              {errors.phonenumber.message}
            </p>
          )}
        </div>
      </div>
      <div className=" grid grid-cols-3 gap-4">
        {/* Tỉnh/Thành phố */}
        <div>
          <Label htmlFor="province" className="text-black text-sm font-medium">
            Tỉnh / Thành phố
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
          <Label htmlFor="district" className="text-black text-sm font-medium">
            Quận / Huyện
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
            Phường / Xã
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
      {/* Địa chỉ chi tiết */}
      <div>
        <Label htmlFor="description" className="text-black text-sm font-medium">
          Địa chỉ chi tiết
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
      {/* Hiển thị latitude/longitude nếu đã chọn phường/xã */}
      {/* {selectedWardObj &&
        selectedWardObj.latitude &&
        selectedWardObj.longitude && (
          <div className="mt-2 text-sm text-gray-700">
            <div>
              <span className="font-semibold">Latitude:</span>{" "}
              {selectedWardObj.latitude}
            </div>
            <div>
              <span className="font-semibold">Longitude:</span>{" "}
              {selectedWardObj.longitude}
            </div>
          </div>
        )} */}
      <div className="flex justify-end">
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
              Xác nhận
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default FromAddress;
