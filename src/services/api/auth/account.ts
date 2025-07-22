import rootApi from "../../rootApi";
import { UpdateUser } from "@/types/auth/user";
export const updateUserById = async (userId: string, data: UpdateUser) => {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}')
  const token = userData.token
  if (!token) {
    throw new Error('Not Found token')
  }
  const response = await rootApi.put(`accounts/${userId}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}
