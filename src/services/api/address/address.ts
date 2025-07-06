import { CreateAddress } from './../../../types/address/address';
import rootApi from "../../rootApi";
// Register Address

export const CreateAddresses = async (data: CreateAddress) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
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
export const getAddressByShopId = async (shopId: string) => {
  try {
  const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }


    const response = await rootApi.get(`addresses/shops/${shopId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("Error get address by shopId:", error);
    throw error;
  }
};
