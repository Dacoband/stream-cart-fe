import React, { useEffect, useState } from "react";
import {
  getProvinces2,
  getDistrict2,
  getWard2,
  Province2,
} from "@/services/api/address/listaddress";
import { getLatLngFromAddress } from "@/services/api/address/listaddress";

function FromAddress2() {
  const [provinces, setProvinces] = useState<Province2[]>([]);
  const [districts, setDistricts] = useState<Province2[]>([]);
  const [wards, setWards] = useState<Province2[]>([]);
  const [provinceCode, setProvinceCode] = useState<number | "">("");
  const [districtCode, setDistrictCode] = useState<number | "">("");
  const [wardCode, setWardCode] = useState<number | "">("");
  const [addressDetail, setAddressDetail] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);

  useEffect(() => {
    getProvinces2().then((data) => {
      if (Array.isArray(data)) setProvinces(data);
      else setProvinces([]);
    });
  }, []);

  useEffect(() => {
    if (provinceCode) {
      getDistrict2(Number(provinceCode)).then((data: any) => {
        if (data && data.districts) setDistricts(data.districts);
        else setDistricts([]);
        setDistrictCode("");
        setWards([]);
        setWardCode("");
      });
    } else {
      setDistricts([]);
      setDistrictCode("");
      setWards([]);
      setWardCode("");
    }
  }, [provinceCode]);

  useEffect(() => {
    if (districtCode) {
      getWard2(Number(districtCode)).then((data: any) => {
        if (data && data.wards) setWards(data.wards);
        else setWards([]);
        setWardCode("");
      });
    } else {
      setWards([]);
      setWardCode("");
    }
  }, [districtCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const provinceName =
      provinces.find((p) => p.code === provinceCode)?.name || "";
    const districtName =
      districts.find((d) => d.code === districtCode)?.name || "";
    const wardName = wards.find((w) => w.code === wardCode)?.name || "";
    const fullAddress = [addressDetail, wardName, districtName, provinceName]
      .filter(Boolean)
      .join(", ");
    alert("Địa chỉ đã chọn: " + fullAddress);
  };

  const handleGetLatLng = async () => {
    const provinceName =
      provinces.find((p) => p.code === provinceCode)?.name || "";
    const districtName =
      districts.find((d) => d.code === districtCode)?.name || "";
    const wardName = wards.find((w) => w.code === wardCode)?.name || "";

    const result = await getLatLngFromAddress(
      addressDetail,
      wardName,
      districtName,
      provinceName
    );
    if (result) {
      // result.lat, result.lon là tọa độ bạn cần
      setLat(result.lat);
      setLon(result.lon);
    } else {
      // Xử lý khi không tìm thấy vị trí
      alert("Không tìm thấy vị trí trên bản đồ!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
      <div>
        <label className="block mb-1 font-medium">Tỉnh / Thành phố</label>
        <select
          className="w-full border p-2 rounded"
          value={provinceCode}
          onChange={(e) =>
            setProvinceCode(e.target.value ? Number(e.target.value) : "")
          }
        >
          <option value="">-- Chọn tỉnh/thành phố --</option>
          {provinces.map((province) => (
            <option key={province.code} value={province.code}>
              {province.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1 font-medium">Quận / Huyện</label>
        <select
          className="w-full border p-2 rounded"
          value={districtCode}
          onChange={(e) =>
            setDistrictCode(e.target.value ? Number(e.target.value) : "")
          }
          disabled={!provinceCode}
        >
          <option value="">-- Chọn quận/huyện --</option>
          {districts.map((district: any) => (
            <option key={district.code} value={district.code}>
              {district.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1 font-medium">Phường / Xã</label>
        <select
          className="w-full border p-2 rounded"
          value={wardCode}
          onChange={(e) =>
            setWardCode(e.target.value ? Number(e.target.value) : "")
          }
          disabled={!districtCode}
        >
          <option value="">-- Chọn phường/xã --</option>
          {wards.map((ward: any) => (
            <option key={ward.code} value={ward.code}>
              {ward.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1 font-medium">Địa chỉ cụ thể</label>
        <input
          className="w-full border p-2 rounded"
          placeholder="Số nhà, tên đường..."
          value={addressDetail}
          onChange={(e) => setAddressDetail(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Xác nhận
      </button>
      <button
        type="button"
        onClick={handleGetLatLng}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
      >
        Lấy tọa độ
      </button>
      {lat !== null && lon !== null && (
        <div className="mt-4">
          <p className="font-medium">Tọa độ:</p>
          <p>
            Vĩ độ: {lat}, Kinh độ: {lon}
          </p>
        </div>
      )}
    </form>
  );
}

export default FromAddress2;
