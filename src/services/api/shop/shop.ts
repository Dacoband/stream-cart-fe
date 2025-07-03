import { RegisterShop } from './../../../types/shop/shop';
import rootApi from "../../rootApi";

// Register Shop
export const registerShop = async (data: RegisterShop) => {
  try {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const token = userData.token;
    if (!token) {
      throw new Error("No token found");
    }
    const response = await rootApi.post(
      "shops",
      data,
      {
       headers: {
  Authorization: `Bearer ${token}`, 
},

      }
    );
   
    return response.data;
  } catch (error) {
    console.error("Error registering shop:", error);
    throw error;
  }
};

export const getMyShop = async (token: string) => {
  try {
    const response = await rootApi.get("shops/my-shops", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching Shop:", error);
    throw error;
  }
};