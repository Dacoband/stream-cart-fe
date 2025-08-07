import rootApi from "../../rootApi";
export const getAttributeValueByPAId = async (productAttributeId:string) => {
  try {
    const response = await rootApi.get(`attribute-values/attribute/${productAttributeId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching product detail:", error);
    throw error;
  }
};