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
export const getAddressById = async (Id: string) => {
  try {
  const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }


    const response = await rootApi.get(`addresses/${Id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("Error get address by Id:", error);
    throw error;
  }
};

// UpdateAddress
// export const UpdateAddress = async (shopId: string) => {
//   try {
//   const token = localStorage.getItem("token");
//     if (!token) {
//       throw new Error("Not found token.");
//     }


//     const response = await rootApi.get(`addresses/shops/${shopId}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     return response.data.data;
//   } catch (error) {
//     console.error("Error get address by shopId:", error);
//     throw error;
//   }
// };
// Get Address for user
export const getAddressUser= async () => {
  try {
  const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }


    const response = await rootApi.get(`addresses`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("Error get address for user:", error);
    throw error;
  }
};
export const getAddressDefaultShipping= async () => {
  try {
  const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }


    const response = await rootApi.get(`addresses/default-shipping`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("Error get address default shipping for user:", error);
    throw error;
  }
};