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