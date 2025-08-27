import { CreateReview } from '@/types/review/review';
import rootApi from '../../rootApi';
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
export const searchReviews = async (
  params: {
    Type: number;
    FromDate?: Date;
    ToDate?: Date;
    PageNumber?: number;
    PageSize?: number;
  }
) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

 
    const searchParams: Record<string, string | number> = {
      Type: params.Type,
    };
    if (typeof params.PageNumber === 'number') searchParams.PageNumber = params.PageNumber;
    if (typeof params.PageSize === 'number') searchParams.PageSize = params.PageSize;
    if (params.FromDate) searchParams.FromDate = params.FromDate.toISOString();
    if (params.ToDate) searchParams.ToDate = params.ToDate.toISOString();

    const response = await rootApi.get('reviews/search', {
      params: searchParams,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error;
  }
};
