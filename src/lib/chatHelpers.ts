import { ChatMessage } from '../types/chat/chat';

export function mapSignalRToChatMessage(raw: Record<string, unknown>): ChatMessage {
  const get = (k: string) => raw[k] as string | undefined;

  const id =
    get('messageId') ?? get('MessageId') ??
    get('id') ?? get('Id') ?? `${Date.now()}`;

  const chatRoomId =
    get('chatRoomId') ?? get('ChatRoomId') ??
    get('roomId') ?? get('RoomId') ??
    get('chatRoom') ?? get('ChatRoom') ?? '';

  const senderUserId =
    get('senderUserId') ?? get('SenderUserId') ??
    get('senderId') ?? get('SenderId') ??
    get('userId') ?? get('UserId') ?? '';

  const content =
    get('message') ?? get('Message') ??
    get('content') ?? get('Content') ??
    get('text') ?? get('Text') ??
    get('body') ?? get('Body') ?? '';

  const sentAt =
    get('timestamp') ?? get('Timestamp') ??
    get('sentAt') ?? get('SentAt') ??
    get('createdAt') ?? get('CreatedAt') ?? new Date().toISOString();

  const messageType = get('messageType') ?? get('MessageType') ?? 'Text';
  const attachmentUrl = (get('attachmentUrl') ?? get('AttachmentUrl') ?? null) as string | null;
  const editedAt = (get('editedAt') ?? get('EditedAt') ?? null) as string | null;
  const senderName = get('senderName') ?? get('SenderName') ?? get('userName') ?? get('UserName') ?? '';
  const senderAvatarUrl = get('senderAvatarUrl') ?? get('SenderAvatarUrl') ?? get('avatarUrl') ?? get('AvatarUrl') ?? '';

  return {
    id,
    chatRoomId,
    senderUserId,
    content,
    sentAt,
    isRead: false,
    isEdited: false,
    messageType,
    attachmentUrl,
    editedAt,
    senderName,
    senderAvatarUrl,
    isMine: false,
  } as ChatMessage;
}
