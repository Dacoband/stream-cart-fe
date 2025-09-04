"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { MapPin, CircleCheckBig, Loader2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { UpdateAddressById } from "@/services/api/address/address";
import {
  getProvinces,
  getDistrict,
  getWard,
} from "@/services/api/address/listaddress";
import type {
  Address,
  UpdateAddress,
  Province,
  Ward,
} from "@/types/address/address";

type ShopAddressForm = {
  street: string;
  ward: string;
  district: string;
  city: string;
  country: string;
  phoneNumber: string;
};

interface Props {
  address: Partial<Address> & { id: string };
  onSuccess?: (updated?: Partial<Address>) => void;
  trigger?: React.ReactNode;
}

export default function DialogUpdateAddress({
  address,
  onSuccess,
  trigger,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ShopAddressForm, string>>
  >({});

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>("");
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("");
  const [selectedWardId, setSelectedWardId] = useState<string>("");
  const [selectedProvinceName, setSelectedProvinceName] = useState<string>("");
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>("");
  const [selectedWardFullName, setSelectedWardFullName] = useState<string>("");

  const [form, setForm] = useState<ShopAddressForm>(() => ({
    street: address?.street ?? "",
    ward: address?.ward ?? "",
    district: address?.district ?? "",
    city: address?.city ?? "",
    country: address?.country ?? "Việt Nam",
    phoneNumber: address?.phoneNumber ?? "",
  }));

  // Load provinces list once when dialog opens
  useEffect(() => {
    if (!isOpen) return;
    if (!provinces.length) {
      getProvinces().then((data) => setProvinces(data || []));
    }
    // Sync latest address into form when dialog opens
    setForm({
      street: address?.street ?? "",
      ward: address?.ward ?? "",
      district: address?.district ?? "",
      city: address?.city ?? "",
      country: address?.country ?? "Việt Nam",
      phoneNumber: address?.phoneNumber ?? "",
    });
    setErrors({});
  }, [isOpen, address, provinces.length]);

  useEffect(() => {
    if (!isOpen || provinces.length === 0) return;
    const province = provinces.find(
      (p) => p.name === address.city || p.full_name === address.city
    );
    if (province) {
      setSelectedProvinceId(province.id);
      setSelectedProvinceName(province.full_name);
      setForm((prev) => ({ ...prev, city: province.name }));
      getDistrict(province.id).then((districtList) =>
        setDistricts(districtList || [])
      );
    }
  }, [isOpen, provinces, address.city]);

  useEffect(() => {
    if (districts.length === 0 || !address.district) return;
    const district = districts.find(
      (d) => d.full_name === address.district || d.name === address.district
    );
    if (district) {
      setSelectedDistrictId(district.id);
      setSelectedDistrictName(district.full_name);
      setForm((prev) => ({ ...prev, district: district.full_name }));
      getWard(district.id).then((wardList) => setWards(wardList || []));
    }
  }, [districts, address.district]);

  useEffect(() => {
    if (wards.length === 0 || !address.ward) return;
    const ward = wards.find((w) => w.full_name === address.ward);
    if (ward) {
      setSelectedWardId(ward.id);
      setSelectedWardFullName(ward.full_name);
      setForm((prev) => ({ ...prev, ward: ward.full_name }));
    }
  }, [wards, address.ward]);

  const requiredMissing = useMemo(() => {
    const missing: Partial<Record<keyof ShopAddressForm, string>> = {};
    if (!form.street?.trim())
      missing.street = "Vui lòng nhập số nhà, tên đường";
    if (!form.ward?.trim()) missing.ward = "Vui lòng nhập phường/xã";
    if (!form.district?.trim()) missing.district = "Vui lòng nhập quận/huyện";
    if (!form.city?.trim()) missing.city = "Vui lòng nhập tỉnh/thành phố";
    if (!form.country?.trim()) missing.country = "Vui lòng nhập quốc gia";
    if (!form.phoneNumber?.trim())
      missing.phoneNumber = "Vui lòng nhập số điện thoại";
    return missing;
  }, [form]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = { ...requiredMissing };
    // Ensure the location selections are chosen
    if (!selectedProvinceId)
      missing.city = missing.city || "Vui lòng chọn tỉnh/thành phố";
    if (!selectedDistrictId)
      missing.district = missing.district || "Vui lòng chọn quận/huyện";
    if (!selectedWardId)
      missing.ward = missing.ward || "Vui lòng chọn phường/xã";
    // Simple phone validation (10-11 digits)
    const phone = form.phoneNumber.trim();
    if (phone && !/^\d{9,12}$/.test(phone)) {
      missing.phoneNumber = "Số điện thoại không hợp lệ";
    }
    setErrors(missing);
    if (Object.keys(missing).length) {
      toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }
    if (!address?.id) return;

    setSaving(true);
    try {
      // Resolve selected entities for final payload
      const province = provinces.find((p) => p.id === selectedProvinceId);
      const district = districts.find((d) => d.id === selectedDistrictId);
      const ward = wards.find((w) => w.id === selectedWardId);

      const payload: UpdateAddress = {
        recipientName: (address.recipientName ?? "Chủ shop").toString(),
        street: form.street.trim(),
        ward: (
          ward?.full_name ||
          selectedWardFullName ||
          form.ward ||
          address.ward ||
          ""
        ).toString(),
        district: (
          district?.full_name ||
          selectedDistrictName ||
          form.district ||
          address.district ||
          ""
        ).toString(),
        city: (
          province?.name ||
          selectedProvinceName ||
          form.city ||
          address.city ||
          ""
        ).toString(),
        country: form.country.trim() || "Việt Nam",
        postalCode: (address.postalCode ?? "7000").toString(),
        phoneNumber: form.phoneNumber.trim(),
        latitude: ward?.latitude
          ? Number(ward.latitude)
          : Number(address.latitude ?? 0),
        longitude: ward?.longitude
          ? Number(ward.longitude)
          : Number(address.longitude ?? 0),
        type: Number(address.type ?? 1),
      };
      const res = await UpdateAddressById(address.id, payload);
      const updated = (res && (res.data ?? res)) || payload;
      toast.success("Cập nhật địa chỉ cửa hàng thành công");
      setIsOpen(false);
      onSuccess?.(updated as Partial<Address>);
    } catch (err) {
      console.error("Shop address update failed", err);
      toast.error("Không thể cập nhật địa chỉ. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <button className="text-blue-600 hover:underline cursor-pointer">
            Chỉnh sửa
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="p-0 m-0 rounded-sm max-w-3xl">
        <DialogHeader className="px-5 py-5 border-b flex gap-4 flex-row items-center">
          <div className="bg-gray-200 rounded-full w-12 h-12 flex justify-center items-center">
            <MapPin className="text-gray-600" />
          </div>
          <div>
            <DialogTitle className="mb-1 font-medium">
              Cập nhật địa chỉ cửa hàng
            </DialogTitle>
            <DialogDescription>
              Vui lòng nhập thông tin địa chỉ
            </DialogDescription>
          </div>
        </DialogHeader>
        <form onSubmit={onSubmit} className="w-full">
          <div className="px-5 py-5 space-y-6">
            <div>
              <Label
                htmlFor="street"
                className="text-black text-sm font-medium mb-1"
              >
                Số nhà, tên đường
              </Label>
              <Input
                id="street"
                value={form.street}
                onChange={(e) =>
                  setForm((p) => ({ ...p, street: e.target.value }))
                }
                placeholder="123 Đường ABC"
              />
              {errors.street && (
                <p className="text-red-500 text-xs mt-1 flex gap-2 items-center">
                  <TriangleAlert size={14} />
                  {errors.street}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-black text-sm font-medium mb-1">
                  Tỉnh/Thành phố
                </Label>
                <select
                  className="w-full border rounded-md px-3 py-2 bg-white"
                  value={selectedProvinceId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedProvinceId(id);
                    const province = provinces.find((p) => p.id === id);
                    setSelectedProvinceName(province?.full_name || "");
                    setForm((p) => ({ ...p, city: province?.name || "" }));
                    setDistricts([]);
                    setWards([]);
                    setSelectedDistrictId("");
                    setSelectedDistrictName("");
                    setSelectedWardId("");
                    setSelectedWardFullName("");
                    if (id) getDistrict(id).then((d) => setDistricts(d || []));
                  }}
                >
                  <option value="">Chọn tỉnh/thành phố</option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name}
                    </option>
                  ))}
                </select>
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1 flex gap-2 items-center">
                    <TriangleAlert size={14} /> {errors.city}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-black text-sm font-medium mb-1">
                  Quận/Huyện
                </Label>
                <select
                  className="w-full border rounded-md px-3 py-2 bg-white"
                  value={selectedDistrictId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedDistrictId(id);
                    const d = districts.find((x) => x.id === id);
                    setSelectedDistrictName(d?.full_name || "");
                    setForm((p) => ({ ...p, district: d?.full_name || "" }));
                    setWards([]);
                    setSelectedWardId("");
                    setSelectedWardFullName("");
                    if (id) getWard(id).then((w) => setWards(w || []));
                  }}
                  disabled={!selectedProvinceId}
                >
                  <option value="">Chọn quận/huyện</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name}
                    </option>
                  ))}
                </select>
                {errors.district && (
                  <p className="text-red-500 text-xs mt-1 flex gap-2 items-center">
                    <TriangleAlert size={14} /> {errors.district}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-black text-sm font-medium mb-1">
                  Phường/Xã
                </Label>
                <select
                  className="w-full border rounded-md px-3 py-2 bg-white"
                  value={selectedWardId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedWardId(id);
                    const w = wards.find((x) => x.id === id);
                    setSelectedWardFullName(w?.full_name || "");
                    setForm((p) => ({ ...p, ward: w?.full_name || "" }));
                  }}
                  disabled={!selectedDistrictId}
                >
                  <option value="">Chọn phường/xã</option>
                  {wards.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.full_name}
                    </option>
                  ))}
                </select>
                {errors.ward && (
                  <p className="text-red-500 text-xs mt-1 flex gap-2 items-center">
                    <TriangleAlert size={14} /> {errors.ward}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="country"
                  className="text-black text-sm font-medium mb-1"
                >
                  Quốc gia
                </Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, country: e.target.value }))
                  }
                  placeholder="Việt Nam"
                />
                {errors.country && (
                  <p className="text-red-500 text-xs mt-1 flex gap-2 items-center">
                    <TriangleAlert size={14} />
                    {errors.country}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="phoneNumber"
                  className="text-black text-sm font-medium mb-1"
                >
                  Số điện thoại
                </Label>
                <Input
                  id="phoneNumber"
                  value={form.phoneNumber}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phoneNumber: e.target.value }))
                  }
                  placeholder="0123456789"
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1 flex gap-2 items-center">
                    <TriangleAlert size={14} />
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between px-5 pb-6 mt-2">
            <DialogClose className="w-40 bg-gray-200 hover:bg-gray-300 text-black cursor-pointer rounded-md py-2 text-sm text-center">
              <>Thoát</>
            </DialogClose>
            <Button
              type="submit"
              className="w-40 bg-[#B0F847] hover:bg-[#B0F847]/80 text-black cursor-pointer"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <CircleCheckBig className="mr-2" />
                  Lưu
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
