export interface ChatRoom {
  id: string;
  userId: string;
  shopId: string;
  startedAt: string;
  lastMessageAt: string;
  relatedOrderId: string;
  isActive: boolean;
  userName: string;
  userAvatarUrl: string;
  shopName: string;
  shopLogoUrl: string;
  lastMessage: ChatMessage;
  unreadCount: number;
  liveKitRoomName: string;
  isLiveKitActive: boolean;
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderUserId: string;
  content: string;
  sentAt: string;
  isRead: boolean;
  isEdited: boolean;
  messageType: string;
  attachmentUrl: string;
  editedAt: string;
  senderName: string;
  senderAvatarUrl: string;
  isMine: boolean;
}


export interface CreateChatRoom {
    shopId:string;
    relatedOrderId:string;
    initialMessage:string;
}
export interface CreateMassage {
   chatRoomId:string;
   content:string;
   messageType:string;
   attachmentUrl:string;
}