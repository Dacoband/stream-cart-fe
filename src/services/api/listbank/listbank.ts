import { Bank } from "@/types/listbank/listbank";
import axios from "axios";

export const getListBank = async (): Promise<Bank[]> => {
  const res = await axios.get("https://api.vietqr.io/v2/banks");
  return res.data.data;
};
