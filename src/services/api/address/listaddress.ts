import { Province,Ward } from "@/types/address/address";
import axios from "axios";

export const getProvinces = async (): Promise<Province[]> => {
  const res = await axios.get("https://esgoo.net/api-tinhthanh/1/0.htm");
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
