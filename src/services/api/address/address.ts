import { CreateAddress } from './../../../types/address/address';
import rootApi from "../../rootApi";
// Register Address

export const CreateAddresses = async (data: CreateAddress) => {
  try {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const token = userData.token;
    if (!token) {
      throw new Error("No token found");
    }
    const response = await rootApi.post(
      "addresses",
      data,
      {
       headers: {
  Authorization: `Bearer ${token}`, 
},

      }
    );
   
    return response.data;
  } catch (error) {
    console.error("Error create address shop:", error);
    throw error;
  }
};