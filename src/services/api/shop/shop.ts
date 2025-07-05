import { RegisterShop } from './../../../types/shop/shop';
import rootApi from "../../rootApi";

// Register Shop
export const registerShop = async (data: RegisterShop) => {
  try {
  const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
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

export const getMyShop = async () => {
  try {
      const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    const response = await rootApi.get("shops/my-shops", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

  return response.data?.[0] || null;
  } catch (error) {
    console.error("Error fetching Shop:", error);
    throw error;
  }
};