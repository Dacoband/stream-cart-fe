"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerAddressCustomer,
  AddressSchemaCustomer,
} from "@/components/schema/address_schema";
import {
  getProvinces,
  getDistrict,
  getWard,
} from "@/services/api/address/listaddress";
import {
  Address,
  Province,
  UpdateAddress,
  Ward,
} from "@/types/address/address";
import { UpdateAddressById } from "@/services/api/address/address";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AxiosError } from "axios";
import { CircleCheckBig, Loader2, MapPin, TriangleAlert } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  address: Address;
  onSuccess?: () => void;
}

export default function DialogUpdateAddress({ address, onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvinceId, setSelectedProvinceId] = useState<string>("");
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("");
  const [selectedWardId, setSelectedWardId] = useState<string>("");

  const [selectedProvinceName, setSelectedProvinceName] = useState<string>("");
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>("");
  const [selectedWardFullName, setSelectedWardFullName] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddressSchemaCustomer>({
    resolver: zodResolver(registerAddressCustomer),
    defaultValues: {
      recipientName: address.recipientName,
      street: address.street,
      phonenumber: address.phoneNumber,
      ward: address.ward,
      district: address.district,
      city: address.city,
    },
  });

  useEffect(() => {
    getProvinces().then((data) => setProvinces(data || []));
  }, []);

  // useEffect(() => {
  //   if (isOpen) {
  //     const province = provinces.find(
  //       (p) => p.name === address.city || p.full_name === address.city
  //     );
  //     if (province) {
  //       setSelectedProvinceId(province.id);
  //       setSelectedProvinceName(province.name);
  //       getDistrict(province.id).then((districts) => {
  //         setDistricts(districts || []);
  //         const district = districts.find(
  //           (d) => d.full_name === address.district
  //         );
  //         if (district) {
  //           setSelectedDistrictId(district.id);
  //           setSelectedDistrictName(district.name);
  //           getWard(district.id).then((wards) => {
  //             setWards(wards || []);
  //             const ward = wards.find((w) => w.full_name === address.ward);
  //             if (ward) {
  //               setSelectedWardId(ward.id);
  //               setSelectedWardFullName(ward.full_name);
  //             }
  //           });
  //         }
  //       });
  //     }
  //   }
  // }, [isOpen, provinces, address.city, address.district, address.ward]);
  useEffect(() => {
    if (!isOpen || provinces.length === 0) return;

    const province = provinces.find((p) => p.name === address.city);
    if (province) {
      setSelectedProvinceId(province.id);
      setSelectedProvinceName(province.full_name);
      setValue("city", province.name);
      getDistrict(province.id).then((districtList) => {
        setDistricts(districtList || []);
      });
    }
  }, [isOpen, provinces, address.city, setValue]);

  useEffect(() => {
    if (districts.length === 0 || !address.district) return;

    const district = districts.find((d) => d.full_name === address.district);
    if (district) {
      setSelectedDistrictId(district.id);
      setSelectedDistrictName(district.full_name);
      setValue("district", district.full_name);

      getWard(district.id).then((wardList) => {
        setWards(wardList || []);
      });
    }
  }, [districts, address.district, setValue]);
  useEffect(() => {
    if (wards.length === 0 || !address.ward) return;

    const ward = wards.find((w) => w.full_name === address.ward);
    if (ward) {
      setSelectedWardId(ward.id);
      setSelectedWardFullName(ward.full_name);
      setValue("ward", ward.full_name);
    }
  }, [wards, address.ward, setValue]);

  const onSubmit = async (data: AddressSchemaCustomer) => {
    setLoading(true);
    try {
      if (!selectedDistrictId || !selectedWardId || !selectedProvinceId) {
        toast.error("Vui lòng chọn đầy đủ Tỉnh, Quận/Huyện và Phường/Xã.");
        setLoading(false);
        return;
      }

      const province = provinces.find((p) => p.id === selectedProvinceId);
      const district = districts.find((d) => d.id === selectedDistrictId);
      const ward = wards.find((w) => w.id === selectedWardId);
      const payload: UpdateAddress = {
        recipientName: data.recipientName,
        street: data.street,
        ward: ward?.full_name || selectedWardFullName || address.ward,
        district: district?.full_name || address.district,
        city: province?.name || address.city,
        country: "Việt Nam",
        postalCode: "7000",
        phoneNumber: data.phonenumber,
        latitude: ward?.latitude
          ? Number(ward.latitude)
          : Number(address.latitude),
        longitude: ward?.longitude
          ? Number(ward.longitude)
          : Number(address.longitude),
        type: address.type,
      };

      if (!province && selectedProvinceName)
        payload.city = selectedProvinceName;
      if (!district && selectedDistrictName)
        payload.district = selectedDistrictName;
      if (!ward && selectedWardFullName) payload.ward = selectedWardFullName;
      await UpdateAddressById(address.id, payload);
      toast.success("Cập nhật địa chỉ thành công");
      setIsOpen(false);
      onSuccess?.();
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      const message = err?.response?.data?.message || "Lỗi cập nhật địa chỉ!";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="text-blue-600 hover:underline cursor-pointer">
          Cập nhật
        </button>
      </DialogTrigger>
      <DialogContent className="p-0 m-0 rounded-sm max-w-xl">
        <DialogHeader className="px-5 py-5 border-b flex gap-4 flex-row items-center">
          <div className="bg-gray-200 rounded-full w-12 h-12 flex justify-center items-center">
            <MapPin className="text-gray-600" />
          </div>
          <div>
            <DialogTitle className="mb-1 font-medium">
              Cập nhật địa chỉ nhận hàng
            </DialogTitle>

            <DialogDescription>
              Vui lòng nhập thông tin trước sáp nhập
            </DialogDescription>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <div className="px-5 py-5 space-y-10">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-black text-sm font-medium mb-1">
                  Tên người nhận
                </Label>
                <Input
                  id="recipientName"
                  placeholder="Nhập tên người nhận"
                  {...register("recipientName")}
                />
                {errors.recipientName && (
                  <p className="text-red-500 text-xs mt-1 flex gap-2">
                    <TriangleAlert size={14} />
                    {errors.recipientName.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-black text-sm font-medium mb-1">
                  Số điện thoại
                </Label>
                <Input
                  id="recipientName"
                  className="bg-white text-black"
                  {...register("phonenumber")}
                  autoComplete="recipientName"
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
              {/* Province */}
              <div>
                <Label
                  htmlFor="province"
                  className="text-black text-sm font-medium mb-1 pb-0"
                >
                  Tỉnh / Thành phố
                </Label>
                <Select
                  value={selectedProvinceId}
                  onValueChange={(id) => {
                    setSelectedProvinceId(id);
                    const province = provinces.find((p) => p.id === id);
                    setSelectedProvinceName(province?.name || "");
                    setValue("city", province?.full_name || "");

                    setDistricts([]);
                    setWards([]);
                    setSelectedDistrictId("");
                    setSelectedDistrictName("");
                    setSelectedWardId("");
                    setSelectedWardFullName("");

                    if (id) {
                      getDistrict(id).then((d) => setDistricts(d || []));
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tỉnh / Thành phố" />
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
                  <p className="text-red-500 text-xs mt-1 flex gap-2 items-center">
                    <TriangleAlert size={14} />
                    {errors.city.message}
                  </p>
                )}
              </div>

              {/* District */}

              <div>
                <Label
                  htmlFor="district"
                  className="text-black text-sm font-medium mb-1"
                >
                  Quận / Huyện
                </Label>
                <Select
                  value={selectedDistrictId}
                  onValueChange={(id) => {
                    setSelectedDistrictId(id);
                    const district = districts.find((d) => d.id === id);
                    setSelectedDistrictName(district?.name || "");
                    setValue("district", district?.full_name || "");

                    setWards([]);
                    setSelectedWardId("");
                    setSelectedWardFullName("");

                    if (id) {
                      getWard(id).then((w) => setWards(w || []));
                    }
                  }}
                  disabled={!selectedProvinceId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn quận/huyện" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.full_name}
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

              {/* Ward */}
              <div>
                <Label
                  htmlFor="description"
                  className="text-black text-sm font-medium mb-1"
                >
                  Phường / Xã
                </Label>
                <Select
                  value={selectedWardId}
                  onValueChange={(id) => {
                    setSelectedWardId(id);
                    const ward = wards.find((w) => w.id === id);
                    setSelectedWardFullName(ward?.full_name || "");
                    setValue("ward", ward?.full_name || "");
                  }}
                  disabled={!selectedDistrictId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn phường/xã" />
                  </SelectTrigger>
                  <SelectContent>
                    {wards.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.full_name}
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
          </div>

          <div className="flex justify-between px-5 pb-10 mt-10">
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
                  Cập nhật
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
