import { CreateReview } from '@/types/review/review';
import rootApi from '../../rootApi'
export const createReview = async (data: CreateReview) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    const response = await rootApi.post(
      "reviews",
      data,
      {
       headers: {
  Authorization: `Bearer ${token}`, 
},

      }
    );
   
    return response.data;
  } catch (error) {
    console.error("Error create reviews:", error);
    throw error;
  }
};