
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