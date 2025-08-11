import rootApi from '../../rootApi'



export const joinChatLiveStream = async (Id: string) => {
  try {
    
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }
  const response = await rootApi.get(
    `/chatsignalr/livestream//${Id}/join`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.data;
  } catch (error) {
    console.error("Error fetching livestreams:", error);
    throw error;
  }
};