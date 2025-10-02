import rootApi from "../../rootApi";

export const getCombinatonByVariantId = async (variantId:string) => {
  try {
    const response = await rootApi.get(`/product-combinations/${variantId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching variant detail:", error);
    throw error;
  }
};