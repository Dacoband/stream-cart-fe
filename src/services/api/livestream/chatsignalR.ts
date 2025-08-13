import rootApi from '../../rootApi'
import { SendChatSignalR } from '@/types/livestream/chatSignalR';



export const joinChatLiveStream = async (Id: string) => {
  try {
    
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }
  const response = await rootApi.post(
    `/chatsignalr/livestream/${Id}/join`,
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

export const SendMessageLiveStream = async (livestreamId: string,data:SendChatSignalR) => {
  try {
    
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }
  const response = await rootApi.post(
    `/chatsignalr/livestream/${livestreamId}/messages`,
    {
      ...data,
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
export const getChatLiveStream = async (livestreamId: string) => {
  try {
    
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }
  const response = await rootApi.get(
    `/chatsignalr/livestream/${livestreamId}/messages`,
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
