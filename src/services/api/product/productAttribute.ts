// Kiểu phân loại, trọng lượng, màu sắc
import rootApi from "../../rootApi";
export const getProductAttributeByProductId = async (productId:string) => {
  try {
    const response = await rootApi.get(`product-attributes/products/${productId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching product attribute:", error);
    throw error;
  }
};