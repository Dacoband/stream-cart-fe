import rootApi from '../../rootApi'






export const createQRPayment = async (orderIds: string[]) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    const response = await rootApi.post(
      "payments/generate-qr-code",
      {
        orderIds: orderIds, 
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating QR payment:", error);
    throw error;
  }
};
