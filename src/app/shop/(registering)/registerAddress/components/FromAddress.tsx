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
function FromAddress() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");
  const selectedWardObj = wards.find((w) => w.id === selectedWard);

  // Lấy tỉnh
  useEffect(() => {
    getProvinces().then((data) => {
      if (Array.isArray(data)) setProvinces(data);
      else setProvinces([]);
    });
  }, []);

  // Lấy quận/huyện khi chọn tỉnh
  useEffect(() => {
    if (selectedProvince) {
      getDistrict(selectedProvince).then((data) => {
        if (Array.isArray(data)) setDistricts(data);
        else setDistricts([]);
        setSelectedDistrict(""); // reset khi đổi tỉnh
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

  // Lấy phường/xã khi chọn quận/huyện
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
    <div className="max-w-md mx-auto mt-6 space-y-4">
      {/* Tỉnh/Thành phố */}
      <div>
        <label className="block mb-2 font-medium">Tỉnh / Thành phố</label>
        <select
          className="w-full border p-2 rounded"
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
        >
          <option value="">-- Chọn tỉnh/thành phố --</option>
          {provinces.map((province) => (
            <option key={province.id} value={province.id}>
              {province.full_name}
            </option>
          ))}
        </select>
      </div>
      {/* Quận/Huyện */}
      <div>
        <label className="block mb-2 font-medium">Quận / Huyện</label>
        <select
          className="w-full border p-2 rounded"
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          disabled={!selectedProvince}
        >
          <option value="">-- Chọn quận/huyện --</option>
          {districts.map((district) => (
            <option key={district.id} value={district.id}>
              {district.full_name}
            </option>
          ))}
        </select>
      </div>
      {/* Phường/Xã */}
      <div>
        <label className="block mb-2 font-medium">Phường / Xã</label>
        <select
          className="w-full border p-2 rounded"
          value={selectedWard}
          onChange={(e) => setSelectedWard(e.target.value)}
          disabled={!selectedDistrict}
        >
          <option value="">-- Chọn phường/xã --</option>
          {wards.map((ward) => (
            <option key={ward.id} value={ward.id}>
              {ward.full_name}
            </option>
          ))}
        </select>
      </div>

      {/* Hiển thị latitude/longitude nếu đã chọn phường/xã */}
      {selectedWardObj &&
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
        )}
    </div>
  );
}

export default FromAddress;
