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

export const getOrderById = async (id: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    const response = await rootApi.get(`orders/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    throw error;
  }
};


export const getOrdersByShop = async (
  shopId: string,
  params?: { PageIndex?: number; PageSize?: number; Status?: number }
) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    const query = new URLSearchParams();
    if (params?.PageIndex) query.set("PageIndex", String(params.PageIndex));
    if (params?.PageSize) query.set("PageSize", String(params.PageSize));
    if (params?.Status !== undefined) query.set("Status", String(params.Status));

    const url = `orders/shop/${shopId}${query.toString() ? `?${query.toString()}` : ""}`;
    const response = await rootApi.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching orders by shop:", error);
    throw error;
  }
};

