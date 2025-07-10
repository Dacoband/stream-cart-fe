import rootApi from '../../rootApi'
import { CreateCart, UpdateCart } from '@/types/Cart/Cart'


export const getCart= async () => {
  try {
  const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }


    const response = await rootApi.get(`carts`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("Error get cart:", error);
    throw error;
  }
};


// CreateCart 
export const createCart = async (data: CreateCart) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    const response = await rootApi.post(
      "carts",
      data,
      {
       headers: {
  Authorization: `Bearer ${token}`, 
},

      }
    );
   
    return response.data;
  } catch (error) {
    console.error("Error create cart:", error);
    throw error;
  }
};

// Update
export const updateCart = async (data: UpdateCart) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    const response = await rootApi.put(
      "carts",
      data,
      {
       headers: {
  Authorization: `Bearer ${token}`, 
},

      }
    );
   
    return response.data;
  } catch (error) {
    console.error("Error update cart:", error);
    throw error;
  }
};
// Delete
export const deleteCart = async (cartId:string) => {
  try {
  const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }


    const response = await rootApi.delete(`carts/${cartId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("Error delete cart :", error);
    throw error;
  }
};
