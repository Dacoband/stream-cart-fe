import rootApi from "../../rootApi";
import { UpdateUser } from "@/types/auth/user";
export const updateUserById = async (userId: string, data: UpdateUser) => {
 
const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Không tìm thấy token.");
    }

  const response = await rootApi.put(`accounts/${userId}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}
