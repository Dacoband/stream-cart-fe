import rootApi from '../../rootApi'



export const getChatBot = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    const response = await rootApi.get(`/chatbot/chat/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // API shape: { success, message, data: { user_id, history: [...] }, errors }
    return response.data?.data;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw error;
  }
};
export const getChatRoom = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    const response = await rootApi.get(`/chatbot/chat/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // API shape: { success, message, data: { user_id, history: [...] }, errors }
    return response.data?.data;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw error;
  }
};
export const createChatBot = async (message: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    // Axios: post(url, data, config)
    const response = await rootApi.post(
      `/chatbot/chatAI`,
      { message },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // API shape: { success, message, data: { response, status, metadata }, errors }
    return response.data?.data;
  } catch (error) {
    console.error("Error creating chatbot message:", error);
    throw error;
  }
};