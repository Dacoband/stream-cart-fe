
import rootApi from "../../rootApi";
export const getVarriantByProductId = async (productId:string) => {
  try {
    const response = await rootApi.get(`/product-variants/product/${productId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching product detail:", error);
    throw error;
  }
};

export const updateStockProductVariant = async (productVarrianId: string, data: { quantity: number }) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    const response = await rootApi.patch(
      `product-variants/${productVarrianId}/stock`, 
      { quantity: data.quantity },  
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating product stock:", error);
    throw error;
  }
};

export const updateProductVariant = async (
  id: string,
  data: {
    sku?: string;
    price?: number;
    flashSalePrice?: number;
    stock?: number;
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
  }
) => {
  try {
    if (!id) throw new Error("Missing id");
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not found token.");

    const response = await rootApi.put(
      `product-variants/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating product variant:", error);
    throw error;
  }
};