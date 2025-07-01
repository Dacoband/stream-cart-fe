import axios from "axios";

export interface Province {
  id: string;
 full_name: string;
}
export interface Ward {
  id: string;
 full_name: string;
  latitude:string;
 longitude:string;
}

// Hàm lấy danh sách tỉnh/thành phố từ API esgoo
export const getProvinces = async (): Promise<Province[]> => {
  const res = await axios.get("https://esgoo.net/api-tinhthanh/1/0.htm");
  // API trả về mảng các object { id, name }
  return res.data.data;
};
export const getDistrict = async (provinceId: string): Promise<Province[]> => {
  const res = await axios.get(`https://esgoo.net/api-tinhthanh/2/${provinceId}.htm`);
  return res.data.data;
};
export const getWard = async (districtId: string): Promise<Ward[]> => {
  const res = await axios.get(`https://esgoo.net/api-tinhthanh/3/${districtId}.htm`);
  return res.data.data;
};
export interface Province2 {
  code: number;
  name: string;
}
export const getProvinces2 = async (): Promise<Province2[]> => {
  const res = await axios.get("https://provinces.open-api.vn/api/p/");
  return res.data;
};
export const getDistrict2 = async (codeProvince: number): Promise<Province2[]> => {
  const res = await axios.get(`https://provinces.open-api.vn/api/p/${codeProvince}?depth=2`);
  return res.data;
};
export const getWard2 = async (codeDistrict2:number): Promise<Province2[]> => {
  const res = await axios.get(`https://provinces.open-api.vn/api/d/${codeDistrict2}?depth=2`);
  return res.data;
};
export const getLatLngFromAddress = async (
  address: string,
  wardName: string,
  districtName: string,
  provinceName: string
): Promise<{ lat: string; lon: string } | null> => {
  const fullAddress = `${districtName}, ${provinceName}, Việt Nam`;
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&countrycodes=vn`,
    {
      headers: {
        "User-Agent": "stream-cart-fe/dev (youremail@domain.com)",
      },
    }
  );
  const data = await res.json();
  if (data && data.length > 0) {
    return { lat: data[0].lat, lon: data[0].lon };
  }
  return null;
};