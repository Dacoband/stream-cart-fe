export type ChatMess = {
  timestamp: string;       
  user_message: string;
  ai_response: string;
};

export type ChatHistory= {
  data: {
    user_id: string;
    history: ChatMess[];
  };
};
