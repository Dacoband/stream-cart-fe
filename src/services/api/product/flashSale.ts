import { CreateFlashSale, DeleteFlashSale, filterFlashSale, UpdateFlashSale } from "@/types/product/flashSale";
import rootApi from "../../rootApi";

export const getFlashSaleCurrent = async () => {
  try {
    const response = await rootApi.get("flashsales/current");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching flash saleproducts:", error);
    throw error;
  }
};
export const getFlashSalesOverView = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }
    const response = await rootApi.get('/flashsales/shop/overview-simple', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    console.log(response)
    return response.data
  } catch (error) {
    console.error('Error fetching flash sales:', error)
    throw error
  }
}
export const getFlashSalesForShop = async (data: filterFlashSale) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    const response = await rootApi.get("/flashsales/my-shop", {
      params: {
        StartDate: data.StartDate ?? null,
        Slot: data.Slot ?? null,
        // pageIndex: data.pageIndex ?? 1,
        // pageSize: data.pageSize ?? 10,
        // isActive: data.isActive ?? null,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(response);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching flash sales:", error);
    throw error;
  }
};

export const createFlashSale = async (data: CreateFlashSale) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    const response = await rootApi.post(
      "/flashsales",
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
export const updateProductFlashSale = async (id:string,data: UpdateFlashSale) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    const response = await rootApi.put(
      `/flashsales/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error update product flash sale:", error);
    throw error;
  }
};


  
export const getSlotCreate = async (date: Date) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    const response = await rootApi.get(`/flashsales/slots/available`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        date: date.toISOString(), 
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error getSlotCreate:", error);
    throw error;
  }
};
export const getProductForFlashSale = async (date: Date, slot: number) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }


    const formattedDate = date.toISOString().split("T")[0];

    const response = await rootApi.get(`/flashsales/products/available`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        date: formattedDate, 
        slot: slot,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error getProductForFlashSale:", error);
    throw error;
  }
};
export const deleteFlashSale = async (data: DeleteFlashSale) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

  const response = await rootApi.delete(`flashsales/slot`, {
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data}
   catch (error) {
    console.error("Error delete flash Sale:", error);
    throw error;
  }
}

export const deleteProductFlashSale = async (id:string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

  const response = await rootApi.delete(`flashsales/${id}`, {
   
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data}
   catch (error) {
    console.error("Error delete product:", error);
    throw error;
  }
}

