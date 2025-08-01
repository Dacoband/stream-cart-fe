import { PreviewDeliveries } from '@/types/deliveries/deliveries';
import rootApi from '../../rootApi'




export const previewDeliveries = async (data:PreviewDeliveries ) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    const response = await rootApi.post(
      "deliveries/preview-order",
      data,
      {
       headers: {
  Authorization: `Bearer ${token}`, 
},

      }
    );
   
    return response.data.data;
  } catch (error) {
    console.error("Error create orders:", error);
    throw error;
  }
};