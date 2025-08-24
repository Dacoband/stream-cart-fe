"use client";

import React, { useEffect, useRef, useState } from 'react';
import chatApi from '@/services/api/chat/chatApiService';
import { signalRChatClient } from '@/services/signalr/signalrChatClient';
import { mapSignalRToChatMessage } from '@/lib/chatHelpers';
import { ChatRoom, ChatMessage } from '@/types/chat/chat';
import { getShopDetail } from '@/services/api/shop/shop';
import { getUserById } from '@/services/api/auth/account';

export default function ShopChatPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [text, setText] = useState('');
  // avatars for selected room
  const [shopLogoUrl, setShopLogoUrl] = useState<string | undefined>(undefined);
  const [customerAvatarUrl, setCustomerAvatarUrl] = useState<string | undefined>(undefined);
  // connected state removed - not used in the component
  const endRef = useRef<HTMLDivElement | null>(null);

  // helpers
  const formatHHmm = (iso?: string) => {
    const d = iso ? new Date(iso) : new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const dayKey = (iso?: string) => {
    const d = iso ? new Date(iso) : new Date();
    return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
  };

  // load rooms
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await chatApi.getShopChatRooms(1, 50, null);
        if (!mounted) return;
        const items = (data.items ?? []).map((it: unknown) => {
          const rec = it as Record<string, unknown>;
          const id = (rec['id'] as string) ?? (rec['_id'] as string) ?? '';
          return ({ ...(rec as object), id } as unknown) as ChatRoom;
        });
        // sort by latest activity desc
        items.sort((a, b) => {
          const ta = Date.parse((a.lastMessage?.sentAt as string) || a.lastMessageAt || '') || 0;
          const tb = Date.parse((b.lastMessage?.sentAt as string) || b.lastMessageAt || '') || 0;
          return tb - ta;
        });
        setRooms(items);
        // auto-select first room if none selected (use functional update to avoid missing deps)
        if (items.length > 0) {
          setSelectedRoom(prev => prev ?? items[0]);
        }
      } catch (err) {
        console.error('load shop rooms failed', err);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // read current user id on mount
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
      if (raw) setCurrentUserId((JSON.parse(raw) as { id?: string }).id ?? null);
    } catch {
      setCurrentUserId(null);
    }
  }, []);

  // signalR handlers
  useEffect(() => {
    const onReceive = (raw: Record<string, unknown>) => {
      try {
        const msg = mapSignalRToChatMessage(raw) as ChatMessage;
  // mark isMine based on the currentUserId state (avoid re-reading localStorage to keep behavior stable)
  msg.isMine = !!(msg.senderUserId && currentUserId && String(msg.senderUserId) === String(currentUserId));
        // some payloads may miss chatRoomId due to casing or server shape; fallback to selectedRoom.id
        if (!msg.chatRoomId && selectedRoom?.id) {
          msg.chatRoomId = selectedRoom.id;
        }

        // if message belongs to selected room, append without duplicating
        if (msg.chatRoomId && selectedRoom && msg.chatRoomId === selectedRoom.id) {
          setMessages(prev => {
            // replace optimistic temp message if content & sender match
            const tempIdx = prev.findIndex(p => p.id.startsWith('temp-') && p.content === msg.content && p.senderUserId === msg.senderUserId);
            if (tempIdx >= 0) {
              const copy = [...prev];
              copy[tempIdx] = msg;
              return copy;
            }
            // otherwise dedupe by id
            if (prev.some(p => p.id === msg.id)) return prev;
            // soft dedupe by same sender+content within 15s
            const toTime = (s?: string) => (Date.parse(s ?? '') || 0);
            const within = (t1: number, t2: number, windowMs = 15000) => Math.abs(t1 - t2) <= windowMs;
            const approxIdx = prev.findIndex(p => (
              String(p.senderUserId ?? '') === String(msg.senderUserId ?? '') &&
              String(p.content ?? '').trim() === String(msg.content ?? '').trim() &&
              within(toTime(p.sentAt), toTime(msg.sentAt))
            ));
            if (approxIdx >= 0) {
              const copy = [...prev];
              copy[approxIdx] = msg; // prefer incoming definitive message
              return copy;
            }
            return [...prev, msg];
          });
        }
        // update room last message/unread
        setRooms(prev => prev.map(r => r.id === msg.chatRoomId ? { ...r, lastMessage: msg } : r));
      } catch {
        // ignore mapping errors
      }
    };

    signalRChatClient.onReceiveMessage = onReceive;
    signalRChatClient.onUserTyping = () => { /* optional */ };

    return () => {
      signalRChatClient.onReceiveMessage = () => {};
    };
  }, [selectedRoom, currentUserId]);

  // join room when selected
  useEffect(() => {
    if (!selectedRoom) return;
    let mounted = true;
    const init = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') ?? undefined : undefined;
        if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG_API === 'true') console.debug('[ShopChatPage] initializing SignalR with token?', !!token);
        const ok = await signalRChatClient.initializeConnection(token);
        if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG_API === 'true') console.debug('[ShopChatPage] initializeConnection result', { ok, isConnected: signalRChatClient.isConnected });
        if (ok) {
          try {
            if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG_API === 'true') console.debug('[ShopChatPage] attempting signalR joinChatRoom', { roomId: selectedRoom.id });
            const joined = await signalRChatClient.joinChatRoom(selectedRoom.id);
            if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG_API === 'true') console.debug('[ShopChatPage] signalR.joinChatRoom result', { roomId: selectedRoom.id, joined });
          } catch (e) {
            console.error('[ShopChatPage] signalR.joinChatRoom failed', e);
          }
          try {
            if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG_API === 'true') console.debug('[ShopChatPage] calling REST joinSignalRChatRoom', { roomId: selectedRoom.id });
            const restJoin = await chatApi.joinSignalRChatRoom(selectedRoom.id);
            if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG_API === 'true') console.debug('[ShopChatPage] REST joinSignalRChatRoom result', { roomId: selectedRoom.id, restJoin });
          } catch (e) {
            console.error('[ShopChatPage] REST joinSignalRChatRoom failed', e);
          }
        }

  const msgs = await chatApi.getChatMessages(selectedRoom.id, 1, 100);
        if (!mounted) return;
  // compute isMine and ensure senderName exists

  const normalized = (msgs.items ?? []).map((m: unknown) => {
          const rec = m as Record<string, unknown>;
          const mapped = mapSignalRToChatMessage(rec as Record<string, unknown>);
          // ensure chatRoomId is present
          if (!mapped.chatRoomId) mapped.chatRoomId = (rec['chatRoomId'] as string) ?? (rec['roomId'] as string) ?? selectedRoom.id;
          // ensure id fallback
          if (!mapped.id) mapped.id = (rec['id'] as string) ?? (rec['_id'] as string) ?? `${Date.now()}`;
          // fallback senderName
          if (!mapped.senderName) mapped.senderName = (rec['senderName'] as string) ?? (rec['userName'] as string) ?? '';
          mapped.isMine = !!(currentUserId && mapped.senderUserId && String(mapped.senderUserId) === String(currentUserId));
          return mapped as ChatMessage;
        });
        // ensure chronological order (oldest -> newest)
        normalized.sort((a, b) => {
          const ta = Date.parse(a.sentAt ?? '') || 0;
          const tb = Date.parse(b.sentAt ?? '') || 0;
          return ta - tb;
        });
        setMessages(normalized);
        // mark read
        await chatApi.markMessagesAsRead(selectedRoom.id);

  // set initial customer avatar from room if present
  setCustomerAvatarUrl(selectedRoom.userAvatarUrl || undefined);

        // fetch shop logo by id if missing or outdated
        try {
          if (selectedRoom.shopId) {
            const shop = await getShopDetail(selectedRoom.shopId);
            const logo = (shop?.logoURL as string) || (shop?.logoUrl as string) || '';
            if (logo) setShopLogoUrl(logo);
          }
        } catch (e) {
          if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG_API === 'true') console.debug('[ShopChatPage] getShopDetail failed', e);
        }

        // if customer avatar is missing, fetch from account API
        try {
          if (!selectedRoom.userAvatarUrl && selectedRoom.userId) {
            const user = await getUserById(String(selectedRoom.userId));
            const avatar = (user?.avatarUrl as string) || (user?.avatarURL as string) || (user?.imageUrl as string) || (user?.profileImageUrl as string) || '';
            if (avatar) setCustomerAvatarUrl(avatar);
          }
        } catch (e) {
          if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG_API === 'true') console.debug('[ShopChatPage] getUserById failed', e);
        }
        // refresh rooms list unread counts
        const data = await chatApi.getShopChatRooms(1, 50, null);
        if (mounted) {
          const items = (data.items ?? []).map((it: unknown) => {
            const rec = it as Record<string, unknown>;
            const id = (rec['id'] as string) ?? (rec['_id'] as string) ?? '';
            return ({ ...(rec as object), id } as unknown) as ChatRoom;
          });
          items.sort((a, b) => {
            const ta = Date.parse((a.lastMessage?.sentAt as string) || a.lastMessageAt || '') || 0;
            const tb = Date.parse((b.lastMessage?.sentAt as string) || b.lastMessageAt || '') || 0;
            return tb - ta;
          });
          setRooms(items);
        }
      } catch (err) {
        console.error('init room failed', err);
      }
  };
    init();

    return () => {
      mounted = false;
      if (selectedRoom) signalRChatClient.leaveChatRoom(selectedRoom.id);
    };
  }, [selectedRoom, currentUserId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const openRoom = (room: ChatRoom) => {
    setSelectedRoom(room);
  };

  const handleSend = async () => {
    if (!selectedRoom || !text.trim()) return;
    const content = text.trim();
    // optimistic
    const optimistic: ChatMessage = {
      id: `temp-${Date.now()}`,
      chatRoomId: selectedRoom.id,
      // use currentUserId if available, fallback to 'shop' string for display only
      senderUserId: currentUserId ?? 'shop',
      content,
      sentAt: new Date().toISOString(),
      isRead: true,
      isEdited: false,
      messageType: 'Text',
      attachmentUrl: '',
      editedAt: '',
      senderName: 'Shop',
      senderAvatarUrl: '',
      isMine: true,
    };
    setMessages(prev => [...prev, optimistic]);
    setText('');

    try {
      await chatApi.sendMessage(selectedRoom.id, content, 'Text');
      // server will broadcast and replace optimistic with real message when received via SignalR
    } catch (err) {
      console.error('send failed', err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
  <aside className="w-80 border-r overflow-auto">
        <div className="p-4 font-semibold">Tin nhắn</div>
        <ul>
          {rooms.map(r => {
            const name = r.userName || r.shopName || 'Không tên';
            const last = r.lastMessage?.content ?? '';
            const time = (r.lastMessage?.sentAt || r.lastMessageAt) ? formatHHmm(r.lastMessage?.sentAt || r.lastMessageAt) : '';
            return (
              <li key={r.id} className={`p-3 hover:bg-gray-50 cursor-pointer ${selectedRoom?.id === r.id ? 'bg-gray-100' : ''}`} onClick={() => openRoom(r)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold overflow-hidden">
                    {r.userAvatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt="avatar" src={r.userAvatarUrl} className="w-full h-full object-cover" />
                    ) : (
                      name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <div className="font-medium truncate">{name}</div>
                      <div className="text-[11px] text-gray-400 ml-2 shrink-0">{time}</div>
                    </div>
                    <div className="text-xs text-gray-500 truncate">{last}</div>
                  </div>
                  {r.unreadCount ? <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{r.unreadCount}</span> : null}
                </div>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Conversation */}
      <main className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <div className="font-semibold">{selectedRoom ? (selectedRoom.userName ?? selectedRoom.shopName) : 'Chọn phòng để xem'}</div>
          {selectedRoom && <div className="text-xs text-gray-500">ID phòng: {selectedRoom.id}</div>}
        </div>

        <div className="flex-1 overflow-auto">
          <div className="min-h-full flex flex-col justify-end p-4">
            {selectedRoom ? (
              <>
                {/* messages with date separators, anchored to bottom */}
                {messages.length === 0 && (
                  <div className="text-gray-500 text-sm mb-4">Chưa có tin nhắn</div>
                )}
                {messages.map((m, idx) => {
                  const prev = messages[idx - 1];
                  const showDate = !prev || dayKey(prev.sentAt) !== dayKey(m.sentAt);
                  const mine = !!(currentUserId && m.senderUserId && String(m.senderUserId) === String(currentUserId));
                  const avatar = mine ? (shopLogoUrl || selectedRoom.shopLogoUrl || '') : (customerAvatarUrl || selectedRoom.userAvatarUrl || '');
                  return (
                    <React.Fragment key={m.id}>
                      {showDate && (
                        <div className="text-center text-[11px] text-gray-400 my-2">
                          {new Date(m.sentAt).toLocaleDateString()}
                        </div>
                      )}
                      <div className={`flex items-end mb-2 ${mine ? 'justify-end' : 'justify-start'}`}>
                        {!mine && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 overflow-hidden">
                            {avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img alt="avatar" src={avatar} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-semibold">{(selectedRoom.userName || 'U').charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                        )}
                        <div className={`max-w-[70%] px-3 py-2 rounded-2xl ${mine ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
                          <div className="whitespace-pre-wrap break-words">{m.content}</div>
                          <div className={`text-[10px] mt-1 ${mine ? 'text-blue-100' : 'text-gray-400'}`}>{formatHHmm(m.sentAt)}</div>
                        </div>
                        {mine && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-2 overflow-hidden">
                            {(shopLogoUrl || selectedRoom.shopLogoUrl) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img alt="avatar" src={(shopLogoUrl || selectedRoom.shopLogoUrl) as string} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-semibold">{(selectedRoom.shopName || 'S').charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
                <div ref={endRef} />
              </>
            ) : (
              <div className="text-gray-500">Chưa có cuộc hội thoại được chọn</div>
            )}
          </div>
        </div>

        {selectedRoom && (
          <div className="p-3 border-t flex gap-2">
            <input className="flex-1 border rounded-full px-4 py-2" placeholder="Nhập tin nhắn..." value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSend(); }} />
            <button className="px-4 py-2 bg-green-600 text-white rounded-full" onClick={handleSend}>Gửi</button>
          </div>
        )}
      </main>
    </div>
  );
}
