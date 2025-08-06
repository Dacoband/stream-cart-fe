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

export const updateLivestream = async (Id: string,data:UpdateLivestream ) => {
  try {
    
const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }
    const response = await rootApi.put(`/livestreams/${Id}`,data, {
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


export const deleteLivestream = async (Id: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }
    const response = await rootApi.delete(`/livestreams/${Id}/start`, {
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
export const   promoteLivestream= async (Id: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }
    const response = await rootApi.post(`/livestreams/${Id}/promote`, {
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
    const response = await rootApi.get("/livestreams/active?promotedOnly=true");
    return response.data;
  } catch (error) {
    console.error("Error fetching active livestreams:", error);
    throw error;
  }
};
 




  

 
