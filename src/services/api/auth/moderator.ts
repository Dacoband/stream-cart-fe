import rootApi from "../../rootApi";
import { CreateModerator } from "@/types/auth/user";
export const getModeratorsByShop = async (shopId: string) => {
  try {const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Không tìm thấy token.");
  }

  const response = await rootApi.get(`/accounts/moderators/by-shop/${shopId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data
  } catch (error) {
    console.error('Error fetching list moderators:', error)
    throw error
  }
}
export const createModerator = async (shopId: string,data:CreateModerator) => {
  try {const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Không tìm thấy token.");
  }

  const response = await rootApi.post(`/accounts/moderators?shopId=${shopId}`,data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data
  } catch (error) {
    console.error('Error fetching list moderators:', error)
    throw error
  }
}
export const deletesModeratorById = async (moderatorId: string,shopId:string) => {
  try{
 
const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Không tìm thấy token.");
    }

  const response = await rootApi.delete(`accounts/moderators/${moderatorId}/shops/${shopId}`, {
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