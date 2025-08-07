"use client";
import { MapPin, MapPinOff, Plus } from "lucide-react";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogClose } from "@/components/ui/dialog";
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
  registerAddressCustomer,
  AddressSchemaCustomer,
} from "@/components/schema/address_schema";
import { CreateAddress } from "@/types/address/address";
import { CreateAddresses } from "@/services/api/address/address";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { CircleCheckBig, Loader2, TriangleAlert } from "lucide-react";
import { Province, Ward } from "@/types/address/address";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
interface DialogAddressProps {
  onSuccess?: (newAddressId: string) => void;
}

const DialogAddress = ({ onSuccess }: DialogAddressProps) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>("");
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("");
  const [selectedWardId, setSelectedWardId] = useState<string>("");
  const selectedWardObj = wards.find((w) => w.id === selectedWardId);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddressSchemaCustomer>({
    resolver: zodResolver(registerAddressCustomer),
    defaultValues: {
      city: "",
      district: "",
      ward: "",
    },
  });
  const onSubmit = async (data: AddressSchemaCustomer) => {
    setLoading(true);
    try {
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
        type: 4,
        shopId: null,
      };
      console.log(payload);
      const responseData = await CreateAddresses(payload);
      if (onSuccess && responseData?.data?.id) {
        onSuccess(responseData.data.id);
      }
      toast.dismiss();
      toast.success(responseData.message);
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      const message = err?.response?.data?.message || "Có lỗi đang xảy ra!";
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
    <div className="w-full flex justify-center flex-col">
      <div className="text-gray-500 flex flex-col justify-center items-center gap-1 mb-3">
        <MapPinOff size={50} />
        <div>Chưa có địa chỉ nhận hàng</div>
      </div>
      <Dialog>
        <DialogTrigger className=" flex justify-center items-center py-1.5 mt-2 px-5 w-fit mx-auto rounded-md border border-dashed border-lime-600  text-lime-600 bg-white hover:bg-white hover:text-lime-500 hover:border-lime-500 cursor-pointer">
          <Plus />
          Thêm địa chỉ nhận hàng
        </DialogTrigger>
        <DialogContent className="p-0 m-0 rounded-sm max-w-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="  w-full">
            <DialogHeader className="px-5 py-5 border-b flex gap-4 flex-row items-center">
              <div className="bg-gray-200 rounded-full w-12 h-12 flex justify-center items-center">
                <MapPin className="text-gray-600" />
              </div>
              <div>
                <DialogTitle className="mb-1 font-medium">
                  Tạo địa chỉ nhận hàng
                </DialogTitle>

                <DialogDescription>
                  Vui lòng nhập thông tin trước sáp nhập
                </DialogDescription>
              </div>
            </DialogHeader>
            <div className="px-5 py-5 space-y-10">
              <div className="grid grid-cols-2 gap-4">
                {/* Tên người nhận */}
                <div>
                  <Label
                    htmlFor="recipientName"
                    className="text-black text-sm font-medium mb-1"
                  >
                    Tên người nhận
                  </Label>
                  <Input
                    id="recipientName"
                    {...register("recipientName")}
                    className="bg-white text-black"
                    placeholder="Nhập tên người nhận"
                    autoComplete="recipientName"
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
                  <Label
                    htmlFor="phoneNumber"
                    className="text-black text-sm font-medium mb-1"
                  >
                    Số điện thoại
                  </Label>
                  <Input
                    type="tel"
                    id="phoneNumber"
                    {...register("phonenumber")}
                    className="bg-white text-black "
                    placeholder="Nhập số điện thoại"
                    autoComplete="tel"
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
                  <Label
                    htmlFor="province"
                    className="text-black text-sm font-medium mb-1 pb-0"
                  >
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
                      <SelectValue placeholder="Tỉnh/thành phố" />
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
                    className="text-black text-sm font-medium mb-1"
                  >
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
                      <SelectValue placeholder="Quận/huyện" />
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
                    className="text-black text-sm font-medium mb-1"
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
                      <SelectValue placeholder="Phường/xã" />
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
                <Label
                  htmlFor="description"
                  className="text-black text-sm font-medium mb-1"
                >
                  Địa chỉ chi tiết (địa chỉ đầu tiên sẽ là địa chỉ mặc định của
                  bạn)
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
            <div className="flex justify-between px-5 pb-10">
              <DialogClose className="w-44 bg-gray-200 hover:bg-gray-300 text-black hover:text-black/80 cursor-pointer rounded-md">
                <>Thoát</>
              </DialogClose>
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DialogAddress;
