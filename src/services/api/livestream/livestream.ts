
import { CreateLivestream, UpdateLivestream  } from './../../../types/livestream/livestream';
import rootApi from '../../rootApi'

export const createLivestream = async (data: CreateLivestream) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    const response = await rootApi.post(
      "livestreams",
      data,
      {
       headers: {
  Authorization: `Bearer ${token}`, 
},

      }
    );
   
    return response.data;
  } catch (error) {
    console.error("Error create live:", error);
    throw error;
  }
};
export const getLivestreamById = async (Id: string) => {
  try {
    
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }
  const response = await rootApi.get(
    `livestreams/${Id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.data;
  } catch (error) {
    console.error("Error fetching livestreams:", error);
    throw error;
  }
};
export const getJoinLivestream = async (Id: string) => {
  try {
    
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }
  const response = await rootApi.get(
    `livestreams/${Id}/join`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.data;
  } catch (error) {
    console.error("Error fetching livestreams:", error);
    throw error;
  }
};
export const getLivestreamByShopId = async (shopId: string) => {
  try {
    
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }
  const response = await rootApi.get(
    `livestreams/shop/${shopId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.data;
  } catch (error) {
    console.error("Error fetching livestreams:", error);
    throw error;
  }
};

export const getLivestreamStatisticsByShop = async (shopId: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    const response = await rootApi.get(`/livestreams/shop/${shopId}/statistics`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("Error fetching livestream statistics:", error);
    throw error;
  }
};

export const getLivestreamStatisticsByShopWithDateFilter = async (
  shopId: string, 
  fromDate?: string, 
  toDate?: string
) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    const query = new URLSearchParams();
    if (fromDate) query.set("fromDate", fromDate);
    if (toDate) query.set("toDate", toDate);

    const url = `/livestreams/shop/${shopId}/statistics${query.toString() ? `?${query.toString()}` : ""}`;
    const response = await rootApi.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("Error fetching livestream statistics with date filter:", error);
    throw error;
  }
};
export const startLivestreamById = async (Id: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }
    const response = await rootApi.post(`/livestreams/${Id}/start`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching start livestreams:", error);
    throw error;
  }
};
export const endLivestreamById = async (Id: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }
    const response = await rootApi.post(`/livestreams/${Id}/end`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching start livestreams:", error);
    throw error;
  }
};

export const updateLivestream = async (Id: string, data: UpdateLivestream) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    const response = await fetch(`https://brightpa.me/api/livestreams/${Id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to update livestream');
    }
    
    if (!result.success) {
      throw new Error(result.message || 'API returned unsuccessful response');
    }
    
    return result.data;
  } catch (error) {
    console.error("Error updating livestream:", error);
    throw error;
  }
};


export const deleteLivestream = async (Id: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }
    const response = await rootApi.delete(`/livestreams/${Id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching delete livestreams:", error);
    throw error;
  }
};
export const   approveContent = async (Id: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }
    const response = await rootApi.post(`/livestreams/${Id}/approve-content`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching approve livestreams:", error);
    throw error;
  }
};
export const   promoteLivestream= async (Id: string,data: { isPromoted: boolean }) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }
    const response = await rootApi.post(`/livestreams/${Id}/promote`,data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching approve livestreams:", error);
    throw error;
  }
};
export const  getSellerLivestreams = async (sellerId: string) => {
  try {
    
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }
  const response = await rootApi.get(
    `/livestreams/seller/${sellerId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.data;
  } catch (error) {
    console.error("Error fetching livestreams:", error);
    throw error;
  }
};
export const getLivestreamActive = async () => {
  try {
    const response = await rootApi.get("/livestreams/active");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching active livestreams:", error);
    throw error;
  }
};
 

 


// Gọi API mới từ brightpa.me
export const getLivestreamByIdFromAPI = async (livestreamId: string) => {
  try {
    const response = await fetch(`https://brightpa.me/api/livestreams/${livestreamId}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch livestream');
    }
    
    if (!result.success) {
      throw new Error(result.message || 'API returned unsuccessful response');
    }
    
    return result.data;
  } catch (error) {
    console.error("Error fetching livestream from API:", error);
    throw error;
  }
};

// Gọi API để lấy sản phẩm của livestream
export const getLivestreamProducts = async (livestreamId: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    const response = await fetch(`https://brightpa.me/api/livestream-products/livestream/${livestreamId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch livestream products');
    }
    
    if (!result.success) {
      throw new Error(result.message || 'API returned unsuccessful response');
    }
    
    return result.data;
  } catch (error) {
    console.error("Error fetching livestream products:", error);
    throw error;
  }
};

// Gọi API để lấy sản phẩm bán chạy nhất của livestream
export const getBestSellingProducts = async (livestreamId: string, limit: number = 3) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    const response = await fetch(`https://brightpa.me/api/livestream-products/livestream/${livestreamId}/best-selling?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch best selling products');
    }
    
    if (!result.success) {
      throw new Error(result.message || 'API returned unsuccessful response');
    }
    
    return result.data;
  } catch (error) {
    console.error("Error fetching best selling products:", error);
    throw error;
  }
};

 
