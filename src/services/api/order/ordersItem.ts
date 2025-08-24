import rootApi from "../../rootApi";
import { OrderItemResponse } from "@/types/order/order";

export interface GetOrdersItemParams {
  orderId: string;
}

export interface GetOrdersItemResponse {
  items: OrderItemResponse[];
}

// Get order items by orderId
export const getOrdersItem = async (
  params: GetOrdersItemParams
): Promise<GetOrdersItemResponse> => {
  try {
    console.log(params.orderId);
    const response = await rootApi.get(
      `order-items/by-order/${params.orderId}`
    );
    return {
      items: response.data.items || [],
    };
  } catch (error) {
    console.error("Error fetching order items:", error);
    throw error;
  }
};

// Get a single order item by orderId and itemId
export const getOrderItem = async (
  orderId: string,
  itemId: string
): Promise<OrderItemResponse> => {
  try {
    const response = await rootApi.get(`orders/${orderId}/items/${itemId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching order item:", error);
    throw error;
  }
};

// Get all items for a specific order
export const getOrderItemsByOrderId = async (
  orderId: string
): Promise<OrderItemResponse[]> => {
  try {
    const response = await rootApi.get(`orders/${orderId}/items`);
    return response.data.items || [];
  } catch (error) {
    console.error("Error fetching order items by orderId:", error);
    throw error;
  }
};
export const getOrderProductByOrderId = async (id: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    const response = await rootApi.get(`/order-items/by-order/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching order product by ID:", error);
    throw error;
  }
};