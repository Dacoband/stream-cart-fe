import rootApi from "../../rootApi";

export const getAttributeValueByPAId = async (productAttributeId: string) => {
  try {
    const response = await rootApi.get(`attribute-values/attribute/${productAttributeId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching attribute values:", error);
    throw error;
  }
};

export const updateAttributeValue = async (
  id: string,
  data: { valueName?: string }
) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) throw new Error("No authentication token found");

  const payload: Record<string, unknown> = {};
  if (data.valueName !== undefined) payload.valueName = data.valueName;

  if (Object.keys(payload).length === 0) {
    throw new Error("No updatable fields provided");
  }

  try {
    const response = await rootApi.put(`attribute-values/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error updating attribute value:", error);
    throw error;
  }
};