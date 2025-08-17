import rootApi from '../../rootApi'


export const getProductByLiveStreamId = async (livestreamId: string) => {
  try {
    
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }
  const response = await rootApi.get(
    `livestream-products/livestream/${livestreamId}`,
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



export const getPinProductLiveStream = async (livestreamId: string) => {
  try {
    
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }
  const response = await rootApi.get(
    `/livestream-products/livestream/${livestreamId}/pinned?limit=1`,
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
export const updatePinProductLiveStream = async (
  productLiveId: string,
  isPin: boolean
) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    const response = await rootApi.patch(
      `/livestream-products/${productLiveId}/pin`,
      { isPin }, 
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

export const updateStockProductLiveStream = async (productLiveId: string, stock: number) => {
  try {
    
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }
  const response = await rootApi.patch(
    `/livestream-products/${productLiveId}/stock`,{ stock }, 
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
export const deleteProductLivestream = async (Id: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }
    const response = await rootApi.delete(`/livestream-products/${Id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching delete product livestreams:", error);
    throw error;
  }
};
export const updateStockProductLivestream = async (Id: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }
    const response = await rootApi.patch(`/livestream-products/${Id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching update stock product livestreams:", error);
    throw error;
  }
};