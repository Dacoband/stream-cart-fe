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
export const deletesUserById = async (userId: string) => {
  try{
 
const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Không tìm thấy token.");
    }

  const response = await rootApi.delete(`accounts/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data}
   catch (error) {
    console.error("Error delete user:", error);
    throw error;
  }
}