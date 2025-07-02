"use client";
import { useEffect, useState } from "react";
import {
  getProvinces,
  getDistrict,
  getWard,
  Province,
  Ward,
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
import { TriangleAlert } from "lucide-react";

function FromAddress() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");
  const selectedWardObj = wards.find((w) => w.id === selectedWard);
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
        ward: selectedWard,
        district: selectedDistrict,
        city: selectedProvince,
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
      router.push("/pending-register");
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
    if (selectedProvince) {
      getDistrict(selectedProvince).then((data) => {
        if (Array.isArray(data)) setDistricts(data);
        else setDistricts([]);
        setSelectedDistrict("");
        setWards([]);
        setSelectedWard("");
      });
    } else {
      setDistricts([]);
      setSelectedDistrict("");
      setWards([]);
      setSelectedWard("");
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      getWard(selectedDistrict).then((data) => {
        if (Array.isArray(data)) setWards(data);
        else setWards([]);
        setSelectedWard("");
      });
    } else {
      setWards([]);
      setSelectedWard("");
    }
  }, [selectedDistrict]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-md mx-auto mt-6 space-y-4"
    >
      {/* Tên người nhận */}
      <div>
        <label className="block mb-2 font-medium">Tên người nhận</label>
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
      {/* Số điện thoại */}
      <div>
        <label className="block mb-2 font-medium">Số điện thoại</label>
        <Input {...register("phonenumber")} placeholder="Nhập số điện thoại" />
        {errors.phonenumber && (
          <p className="text-red-500 text-xs mt-1 flex gap-2">
            <TriangleAlert size={14} />
            {errors.phonenumber.message}
          </p>
        )}
      </div>
      {/* Địa chỉ chi tiết */}
      <div>
        <label className="block mb-2 font-medium">Địa chỉ chi tiết</label>
        <Input {...register("street")} placeholder="Số nhà, tên đường..." />
        {errors.street && (
          <p className="text-red-500 text-xs mt-1 flex gap-2">
            <TriangleAlert size={14} />
            {errors.street.message}
          </p>
        )}
      </div>
      {/* Tỉnh/Thành phố */}
      <div>
        <label className="block mb-2 font-medium">Tỉnh / Thành phố</label>
        <Select
          value={selectedProvince}
          onValueChange={(value) => {
            setSelectedProvince(value);
            setValue("city", value); // cập nhật vào form
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
        <label className="block mb-2 font-medium">Quận / Huyện</label>
        <Select
          value={selectedDistrict}
          onValueChange={(value) => {
            setSelectedDistrict(value);
            setValue("district", value);
          }}
          disabled={!selectedProvince}
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
        <label className="block mb-2 font-medium">Phường / Xã</label>
        <Select
          value={selectedWard}
          onValueChange={(value) => {
            setSelectedWard(value);
            setValue("ward", value);
          }}
          disabled={!selectedDistrict}
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
      <Button
        type="submit"
        className="w-full bg-lime-500 text-black hover:bg-lime-600"
        disabled={loading}
      >
        {loading ? "Đang lưu..." : "Xác nhận"}
      </Button>
    </form>
  );
}

export default FromAddress;
