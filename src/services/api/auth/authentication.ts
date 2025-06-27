import { LoginRequest,UserLocal,RegisterUser } from "@/types/auth/user";
import rootApi from "../../rootApi";

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
//Get user login
export const getMe = async (token: string) => {
  try {
    const response = await rootApi.get("auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching:", error);
    throw error;
  }
};
// VerifyOtps
export const verifyOtps = async (otpCode: string,accountId:string) => {
  try {
    const response = await rootApi.post("auth/verify-otp", {
      accountId:accountId,
      otp: otpCode,
    });

    console.log("Fetching OTP succsess:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching:", error);
    throw error;
  }
};
// Resend VerifyOtps

export const ReSendOtp = async (accountId:string) => {
  try {
    const response = await rootApi.post("auth/resend-otp", {
      accountId:accountId,
    
    });

    console.log("Fetching  ReSend OTP succsess:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching:", error);
    throw error;
  }
};
// Register
export const register = async (request: RegisterUser) => {
  try {
    const response = await rootApi.post("auth/register", request);
    console.log("Register succses:", response.data);
    return response.data;
  } catch (error) {
    console.error("Fairl fetching :", error);
    throw error;
  }
};