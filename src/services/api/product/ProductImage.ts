import rootApi from "../../rootApi";

export const getImageProductByProductId = async (productId:string) => {
  try {
    const response = await rootApi.get(`product-images/products/${productId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching product image detail:", error);
    throw error;
  }
};