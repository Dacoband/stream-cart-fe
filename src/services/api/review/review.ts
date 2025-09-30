import { CreateReview, Review } from '@/types/review/review';
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

export const getReview = async (reviewId: string) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not found token.');
    if (!reviewId) throw new Error('Missing reviewId');

    const response = await rootApi.get(`reviews/${reviewId}` , {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data as Review;
  } catch (error) {
    console.error('Error fetching review detail:', error);
    throw error;
  }
};

export const updateReview = async (
  reviewId: string,
  data: { reviewText?: string; rating?: number; imageUrls?: string[] }
) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not found token.');
    if (!reviewId) throw new Error('Missing reviewId');
    const payload: Record<string, unknown> = {};
    if (typeof data.reviewText === 'string') payload.reviewText = data.reviewText;
    if (typeof data.rating === 'number') payload.rating = data.rating;
    if (Array.isArray(data.imageUrls)) payload.imageUrls = data.imageUrls;

    const response = await rootApi.put(`reviews/${reviewId}`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

export const deleteReview = async (reviewId: string) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not found token.');
    if (!reviewId) throw new Error('Missing reviewId');

    const response = await rootApi.delete(`reviews/${reviewId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

export const getLivestreamReviews = async (livestreamId: string) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not found token.');
    if (!livestreamId) throw new Error('Missing livestreamId');

    const response = await rootApi.get(`reviews/livestreams/${livestreamId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching livestream reviews:', error);
    throw error;
  }
};

export const getOrderReviews = async (orderId: string) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not found token.');
    if (!orderId) throw new Error('Missing orderId');

    const response = await rootApi.get(`reviews/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching order reviews:', error);
    throw error;
  }
};

export const getProductReviews = async (
  productId: string,
  params?: {
    pageNumber?: number;
    pageSize?: number;
    minRating?: number;
    maxRating?: number;
    verifiedOnly?: boolean;
    sortBy?: string;
    ascending?: boolean;
  }
) => {
  try {
    // const token = localStorage.getItem('token');
    // if (!token) throw new Error('Not found token.');
    if (!productId) throw new Error('Missing productId');

    const query: Record<string, string | number | boolean> = {};
    if (params) {
      if (typeof params.pageNumber === 'number') query.pageNumber = params.pageNumber;
      if (typeof params.pageSize === 'number') query.pageSize = params.pageSize;
      if (typeof params.minRating === 'number') query.minRating = params.minRating;
      if (typeof params.maxRating === 'number') query.maxRating = params.maxRating;
      if (typeof params.verifiedOnly === 'boolean') query.verifiedOnly = params.verifiedOnly;
      if (params.sortBy) query.sortBy = params.sortBy;
      if (typeof params.ascending === 'boolean') query.ascending = params.ascending;
    }

    const response = await rootApi.get(`reviews/products/${productId}`, {
      params: query,
      // headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    throw error;
  }
};

  export const getUserReviews = async (userId: string) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not found token.');
    if (!userId) throw new Error('Missing userId');

    const response = await rootApi.get(`reviews/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    throw error;
  }
};
