import rootApi from '../../rootApi';
import { ChatRoom, ChatMessage } from '../../../types/chat/chat';

export type Paginated<T> = { items: T[]; total: number; pageNumber: number; pageSize: number };

const chatApi = {
  async _safe<T>(fn: () => Promise<T>, context = ''): Promise<T> {
    try {
      return await fn();
    } catch (err: unknown) {
      try {
        const e = err as { response?: { status?: number; data?: unknown }; message?: string };
        console.error('[chatApi] Error in', context, e?.response?.status, e?.response?.data ?? e?.message ?? err);
      } catch {
        // ignore
      }
      throw err;
    }
  },
  async createChatRoom(shopId: string, relatedOrderId: string | null = null, initialMessage: string | null = null) {
    return await this._safe(async () => {
      // validate shopId
      if (!shopId || String(shopId).trim() === '') throw new Error('Invalid shopId');
      // backend expects PascalCase property names (ShopId...)
      const payload = { ShopId: shopId, RelatedOrderId: relatedOrderId, InitialMessage: initialMessage } as Record<string, unknown>;
      const res = await rootApi.post('chatsignalr/rooms', payload);
      return res.data?.data as ChatRoom;
    }, 'createChatRoom');
  },

  async getChatRooms(pageNumber = 1, pageSize = 20, isActive: boolean | null = null) {
    const params: Record<string, unknown> = { pageNumber, pageSize };
    if (isActive !== null) params.isActive = isActive;
    // If available, include shopId from logged-in userData to ensure backend receives the shop GUID
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('userData');
        if (raw) {
          const parsed = JSON.parse(raw) as Record<string, unknown> | null;
          const shopId = parsed?.shopId ?? parsed?.ShopId ?? null;
          if (shopId) params.shopId = String(shopId);
        }
      } catch {
        // ignore parse errors
      }
    }
    return await this._safe(async () => {
      const res = await rootApi.get('chatsignalr/rooms', { params });
  // normalize server _id -> id for frontend
      const payload = res.data?.data as Paginated<unknown> | undefined;
      if (!payload) return payload as unknown as Paginated<ChatRoom>;
      const items = (payload.items ?? []).map((it: unknown) => {
        const rec = it as Record<string, unknown>;
        return ({ ...(rec as object), id: (rec['id'] as string) ?? (rec['_id'] as string) } as unknown) as ChatRoom;
      });
      return { ...payload, items } as Paginated<ChatRoom>;
    }, 'getChatRooms');
  },

  async getChatRoomWithShop(shopId: string) {
    return await this._safe(async () => {
      const res = await rootApi.get('chatsignalr/rooms', { params: { pageNumber: 1, pageSize: 50 } });
      const items = res.data?.data?.items as unknown[] | undefined;
      if (!items || items.length === 0) return null;
      const norm = items.map((it: unknown) => {
        const rec = it as Record<string, unknown>;
        return ({ ...(rec as object), id: (rec['id'] as string) ?? (rec['_id'] as string) } as unknown) as ChatRoom;
      });
      const found = norm.find(r => {
        const rec = r as unknown as Record<string, unknown>;
        return String(rec.shopId ?? rec.ShopId ?? '') === String(shopId);
      });
      return found ?? null;
    }, 'getChatRoomWithShop');
  },

  async sendMessage(chatRoomId: string, content: string, messageType = 'Text', attachmentUrl: string | null = null) {
    return await this._safe(async () => {
      const res = await rootApi.post('chatsignalr/messages', { chatRoomId, content, messageType, attachmentUrl });
      return res.data?.data as ChatMessage;
    }, 'sendMessage');
  },

  async getChatMessages(chatRoomId: string, pageNumber = 1, pageSize = 50) {
    return await this._safe(async () => {
      const res = await rootApi.get(`chatsignalr/rooms/${chatRoomId}/messages`, { params: { pageNumber, pageSize } });
      const payload = res.data?.data as Paginated<unknown> | undefined;
      if (!payload) return payload as unknown as Paginated<ChatMessage>;
      const items = (payload.items ?? []).map((m: unknown) => {
        const rec = m as Record<string, unknown>;
        return ({ ...(rec as object), id: (rec['id'] as string) ?? (rec['_id'] as string), chatRoomId: (rec['chatRoomId'] as string) ?? (rec['roomId'] as string) ?? (rec['chatRoom'] as string) ?? '' } as unknown) as ChatMessage;
      });
      return { ...payload, items } as Paginated<ChatMessage>;
    }, 'getChatMessages');
  },

  async markMessagesAsRead(chatRoomId: string) {
    return await this._safe(async () => {
      const res = await rootApi.patch(`chatsignalr/rooms/${chatRoomId}/mark-read`);
      return res.data?.data as { success: boolean };
    }, 'markMessagesAsRead');
  },

  async joinSignalRChatRoom(chatRoomId: string) {
    return await this._safe(async () => {
      const res = await rootApi.post(`chatsignalr/rooms/${chatRoomId}/join`);
      return res.data?.data as { success: boolean };
    }, 'joinSignalRChatRoom');
  },

  async getShopChatRooms(pageNumber = 1, pageSize = 20, isActive: boolean | null = null) {
    const params: Record<string, unknown> = { pageNumber, pageSize };
    if (isActive !== null) params.isActive = isActive;
    // Use shop-specific endpoint provided by the backend
    return await this._safe(async () => {
  // do not inject shopId here: backend will resolve shop from the token in Authorization header
  // attach token to Authorization header when available; backend will use it to resolve shop GUID
  const tokenRaw = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const token = tokenRaw ? tokenRaw.replace(/^\"|\"$/g, '').trim() : null;
  const headerValue = token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : undefined;
      if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG_API === 'true') {
        const masked = headerValue ? `${String(headerValue).slice(0,12)}...` : '<no-token>';
        try {
          const raw = localStorage.getItem('userData');
          const parsed = raw ? JSON.parse(raw) : null;
          console.debug('[chatApi] getShopChatRooms params/header', { params, Authorization: masked, userData: parsed });
        } catch {
          console.debug('[chatApi] getShopChatRooms params/header', { params, Authorization: masked });
        }
      }
      const headers = headerValue ? { Authorization: headerValue } : undefined;
      const res = await rootApi.get('chatsignalr/shop-rooms', { params, headers });
  // normalize server _id -> id for frontend
      const payload = res.data?.data as Paginated<unknown> | undefined;
      if (!payload) return payload as unknown as Paginated<ChatRoom>;
      const items = (payload.items ?? []).map((it: unknown) => {
        const rec = it as Record<string, unknown>;
        return ({ ...(rec as object), id: (rec['id'] as string) ?? (rec['_id'] as string) } as unknown) as ChatRoom;
      });
      return { ...payload, items } as Paginated<ChatRoom>;
    }, 'getShopChatRooms');
  }
};

export default chatApi;
