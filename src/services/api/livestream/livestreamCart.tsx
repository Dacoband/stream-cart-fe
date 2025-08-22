import rootApi from "../../rootApi";

export const previewOrderLive = async (cartItemIds: string[]) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    const params = cartItemIds
      .map((id) => `CartItemId=${encodeURIComponent(id)}`)
      .join("&");
    const response = await rootApi.get(
      `/livestream-carts/PreviewOrder?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error preview order:", error);
    throw error;
  }
};
