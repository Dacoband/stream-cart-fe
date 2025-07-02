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
// "use client";
// import { useEffect, useState } from "react";
// import {
//   getProvinces,
//   getDistrict,
//   getWard,
//   Province,
//   Ward,
// } from "@/services/api/address/listaddress";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   registerAddress,
//   AddressSchema,
// } from "@/components/schema/address_schema";
// import { CreateAddress } from "@/types/address/address";
// import { CreateAddresses } from "@/services/api/address/address";
// import { toast } from "sonner";
// import { useRouter } from "next/navigation";
// import { AxiosError } from "axios";

// function FromAddress() {
//   const [provinces, setProvinces] = useState<Province[]>([]);
//   const [districts, setDistricts] = useState<Province[]>([]);
//   const [wards, setWards] = useState<Ward[]>([]);
//   const [selectedProvince, setSelectedProvince] = useState<string>("");
//   const [selectedDistrict, setSelectedDistrict] = useState<string>("");
//   const [selectedWard, setSelectedWard] = useState<string>("");
//   const selectedWardObj = wards.find((w) => w.id === selectedWard);
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<AddressSchema>({
//     resolver: zodResolver(registerAddress),
//   });
//   const onSubmit = async (data: AddressSchema) => {
//     try {
//       const payload: CreateAddress = {
//         username: data.username,
//         password: data.password,
//         email: data.email,
//         phoneNumber: data.phonenumber,
//         fullname: data.fullName,
//         avatarURL: avatarURL || "",
//         role: data.role === "shop" ? 2 : 1,
//       };

//       const responseData = await CreateAddresses(payload);
//       console.log("Register success:", responseData.message);
//       localStorage.setItem("accountId", responseData.data.id);
//       toast.dismiss();
//       toast.success(responseData.message);

//       router.push("/pending-register");
//     } catch (error: unknown) {
//       const err = error as AxiosError<{ message: string }>;
//       const message = err?.response?.data?.message;
//       toast.error(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     getProvinces().then((data) => {
//       if (Array.isArray(data)) setProvinces(data);
//       else setProvinces([]);
//     });
//   }, []);

//   useEffect(() => {
//     if (selectedProvince) {
//       getDistrict(selectedProvince).then((data) => {
//         if (Array.isArray(data)) setDistricts(data);
//         else setDistricts([]);
//         setSelectedDistrict("");
//         setWards([]);
//         setSelectedWard("");
//       });
//     } else {
//       setDistricts([]);
//       setSelectedDistrict("");
//       setWards([]);
//       setSelectedWard("");
//     }
//   }, [selectedProvince]);

//   useEffect(() => {
//     if (selectedDistrict) {
//       getWard(selectedDistrict).then((data) => {
//         if (Array.isArray(data)) setWards(data);
//         else setWards([]);
//         setSelectedWard("");
//       });
//     } else {
//       setWards([]);
//       setSelectedWard("");
//     }
//   }, [selectedDistrict]);

//   return (
//     <div className="max-w-md mx-auto mt-6 space-y-4">
//       {/* Tỉnh/Thành phố */}
//       <div>
//         <label className="block mb-2 font-medium">Tỉnh / Thành phố</label>
//         <Select
//           value={selectedProvince}
//           onValueChange={(value) => setSelectedProvince(value)}
//         >
//           <SelectTrigger className="w-full">
//             <SelectValue placeholder="Chọn tỉnh/thành phố" />
//           </SelectTrigger>
//           <SelectContent>
//             {provinces.map((province) => (
//               <SelectItem key={province.id} value={province.id}>
//                 {province.full_name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
//       {/* Quận/Huyện */}
//       <div>
//         <label className="block mb-2 font-medium">Quận / Huyện</label>
//         <Select
//           value={selectedDistrict}
//           onValueChange={(value) => setSelectedDistrict(value)}
//           disabled={!selectedProvince}
//         >
//           <SelectTrigger className="w-full">
//             <SelectValue placeholder="Chọn quận/huyện" />
//           </SelectTrigger>
//           <SelectContent>
//             {districts.map((district) => (
//               <SelectItem key={district.id} value={district.id}>
//                 {district.full_name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
//       {/* Phường/Xã */}
//       <div>
//         <label className="block mb-2 font-medium">Phường / Xã</label>
//         <Select
//           value={selectedWard}
//           onValueChange={(value) => setSelectedWard(value)}
//           disabled={!selectedDistrict}
//         >
//           <SelectTrigger className="w-full">
//             <SelectValue placeholder="Chọn phường/xã" />
//           </SelectTrigger>
//           <SelectContent>
//             {wards.map((ward) => (
//               <SelectItem key={ward.id} value={ward.id}>
//                 {ward.full_name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Hiển thị latitude/longitude nếu đã chọn phường/xã */}
//       {selectedWardObj &&
//         selectedWardObj.latitude &&
//         selectedWardObj.longitude && (
//           <div className="mt-2 text-sm text-gray-700">
//             <div>
//               <span className="font-semibold">Latitude:</span>{" "}
//               {selectedWardObj.latitude}
//             </div>
//             <div>
//               <span className="font-semibold">Longitude:</span>{" "}
//               {selectedWardObj.longitude}
//             </div>
//           </div>
//         )}
//     </div>
//   );
// }

// export default FromAddress;
