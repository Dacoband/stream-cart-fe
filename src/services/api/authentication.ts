import { LoginRequest,UserLocal } from "@/types/user";
import rootApi from "../rootApi";

// Login
export const loginApi = async (request: LoginRequest) => {
  try {
    const response = await rootApi.post("auth/login", request);

   
    const data = response.data?.data;

    if (data && data.token && data.account) {
      const userData: UserLocal = {
        token: data.token,
        userId: data.account.id,
        username: data.account.username,
        role: data.account.role,
        isActive: data.account.isActive,
        isVerified: data.account.isVerified,
      };


      localStorage.setItem("userData", JSON.stringify(userData));
    }
        console.log(`Fetching sucsses`,response.data)

    return response;
  } catch (error) {
    console.error(`Error fetching`, error);
    throw error; 
  }
};