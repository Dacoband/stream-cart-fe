import rootApi from '../../rootApi'
import { CreateOrder } from '@/types/order/order';



export const createOrder = async (data:CreateOrder ) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    const response = await rootApi.post(
      "orders/multi",
      data,
      {
       headers: {
  Authorization: `Bearer ${token}`, 
},

      }
    );
   
    return response.data;
  } catch (error) {
    console.error("Error create orders:", error);
    throw error;
  }
};