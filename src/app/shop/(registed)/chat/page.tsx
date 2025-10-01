"use client";

import { mapSignalRToChatMessage } from "@/lib/chatHelpers";
import { getUserById } from "@/services/api/auth/account";
import chatApi from "@/services/api/chat/chatApiService";
import { getShopDetail } from "@/services/api/shop/shop";
import { signalRChatClient } from "@/services/signalr/signalrChatClient";
import { ChatMessage, ChatRoom } from "@/types/chat/chat";
import {
  ArrowLeft,
  ImageIcon,
  Paperclip,
  Search,
  Send,
  Smile,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

export default function ShopChatPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  // avatars for selected room
  const [shopLogoUrl, setShopLogoUrl] = useState<string | undefined>(undefined);
  const [customerAvatarUrl, setCustomerAvatarUrl] = useState<
    string | undefined
  >(undefined);
  const endRef = useRef<HTMLDivElement | null>(null);

  // helpers
  const formatHHmm = (iso?: string) => {
    const d = iso ? new Date(iso) : new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatLastSeen = (iso?: string) => {
    if (!iso) return "";
    const now = new Date();
    const date = new Date(iso);
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  const dayKey = (iso?: string) => {
    const d = iso ? new Date(iso) : new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
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
          const id = (rec["id"] as string) ?? (rec["_id"] as string) ?? "";
          return { ...(rec as object), id } as unknown as ChatRoom;
        });
        // sort by latest activity desc
        items.sort((a, b) => {
          const ta =
            Date.parse(
              (a.lastMessage?.sentAt as string) || a.lastMessageAt || ""
            ) || 0;
          const tb =
            Date.parse(
              (b.lastMessage?.sentAt as string) || b.lastMessageAt || ""
            ) || 0;
          return tb - ta;
        });
        setRooms(items);
        // auto-select first room if none selected (use functional update to avoid missing deps)
        if (items.length > 0) {
          setSelectedRoom((prev) => prev ?? items[0]);
        }
      } catch (err) {
        console.error("load shop rooms failed", err);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // read current user id on mount
  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined" ? localStorage.getItem("userData") : null;
      if (raw)
        setCurrentUserId((JSON.parse(raw) as { id?: string }).id ?? null);
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
        msg.isMine = !!(
          msg.senderUserId &&
          currentUserId &&
          String(msg.senderUserId) === String(currentUserId)
        );
        // some payloads may miss chatRoomId due to casing or server shape; fallback to selectedRoom.id
        if (!msg.chatRoomId && selectedRoom?.id) {
          msg.chatRoomId = selectedRoom.id;
        }

        // if message belongs to selected room, append without duplicating
        if (
          msg.chatRoomId &&
          selectedRoom &&
          msg.chatRoomId === selectedRoom.id
        ) {
          setMessages((prev) => {
            // replace optimistic temp message if content & sender match
            const tempIdx = prev.findIndex(
              (p) =>
                p.id.startsWith("temp-") &&
                p.content === msg.content &&
                p.senderUserId === msg.senderUserId
            );
            if (tempIdx >= 0) {
              const copy = [...prev];
              copy[tempIdx] = msg;
              return copy;
            }
            // otherwise dedupe by id
            if (prev.some((p) => p.id === msg.id)) return prev;
            // soft dedupe by same sender+content within 15s
            const toTime = (s?: string) => Date.parse(s ?? "") || 0;
            const within = (t1: number, t2: number, windowMs = 15000) =>
              Math.abs(t1 - t2) <= windowMs;
            const approxIdx = prev.findIndex(
              (p) =>
                String(p.senderUserId ?? "") ===
                  String(msg.senderUserId ?? "") &&
                String(p.content ?? "").trim() ===
                  String(msg.content ?? "").trim() &&
                within(toTime(p.sentAt), toTime(msg.sentAt))
            );
            if (approxIdx >= 0) {
              const copy = [...prev];
              copy[approxIdx] = msg; // prefer incoming definitive message
              return copy;
            }
            return [...prev, msg];
          });
        }
        // update room last message/unread
        setRooms((prev) =>
          prev.map((r) =>
            r.id === msg.chatRoomId ? { ...r, lastMessage: msg } : r
          )
        );
      } catch {
        // ignore mapping errors
      }
    };

    signalRChatClient.onReceiveMessage = onReceive;
    signalRChatClient.onUserTyping = () => {
      /* optional */
    };

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
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token") ?? undefined
            : undefined;
        if (
          typeof window !== "undefined" &&
          process.env.NEXT_PUBLIC_DEBUG_API === "true"
        )
          console.debug(
            "[ShopChatPage] initializing SignalR with token?",
            !!token
          );
        const ok = await signalRChatClient.initializeConnection(token);
        if (
          typeof window !== "undefined" &&
          process.env.NEXT_PUBLIC_DEBUG_API === "true"
        )
          console.debug("[ShopChatPage] initializeConnection result", {
            ok,
            isConnected: signalRChatClient.isConnected,
          });
        if (ok) {
          try {
            if (
              typeof window !== "undefined" &&
              process.env.NEXT_PUBLIC_DEBUG_API === "true"
            )
              console.debug("[ShopChatPage] attempting signalR joinChatRoom", {
                roomId: selectedRoom.id,
              });
            const joined = await signalRChatClient.joinChatRoom(
              selectedRoom.id
            );
            if (
              typeof window !== "undefined" &&
              process.env.NEXT_PUBLIC_DEBUG_API === "true"
            )
              console.debug("[ShopChatPage] signalR.joinChatRoom result", {
                roomId: selectedRoom.id,
                joined,
              });
          } catch (e) {
            console.error("[ShopChatPage] signalR.joinChatRoom failed", e);
          }
          try {
            if (
              typeof window !== "undefined" &&
              process.env.NEXT_PUBLIC_DEBUG_API === "true"
            )
              console.debug("[ShopChatPage] calling REST joinSignalRChatRoom", {
                roomId: selectedRoom.id,
              });
            const restJoin = await chatApi.joinSignalRChatRoom(selectedRoom.id);
            if (
              typeof window !== "undefined" &&
              process.env.NEXT_PUBLIC_DEBUG_API === "true"
            )
              console.debug("[ShopChatPage] REST joinSignalRChatRoom result", {
                roomId: selectedRoom.id,
                restJoin,
              });
          } catch (e) {
            console.error("[ShopChatPage] REST joinSignalRChatRoom failed", e);
          }
        }

        const msgs = await chatApi.getChatMessages(selectedRoom.id, 1, 100);
        if (!mounted) return;
        // compute isMine and ensure senderName exists

        const normalized = (msgs.items ?? []).map((m: unknown) => {
          const rec = m as Record<string, unknown>;
          const mapped = mapSignalRToChatMessage(
            rec as Record<string, unknown>
          );
          // ensure chatRoomId is present
          if (!mapped.chatRoomId)
            mapped.chatRoomId =
              (rec["chatRoomId"] as string) ??
              (rec["roomId"] as string) ??
              selectedRoom.id;
          // ensure id fallback
          if (!mapped.id)
            mapped.id =
              (rec["id"] as string) ??
              (rec["_id"] as string) ??
              `${Date.now()}`;
          // fallback senderName
          if (!mapped.senderName)
            mapped.senderName =
              (rec["senderName"] as string) ??
              (rec["userName"] as string) ??
              "";
          mapped.isMine = !!(
            currentUserId &&
            mapped.senderUserId &&
            String(mapped.senderUserId) === String(currentUserId)
          );
          return mapped as ChatMessage;
        });
        // ensure chronological order (oldest -> newest)
        normalized.sort((a, b) => {
          const ta = Date.parse(a.sentAt ?? "") || 0;
          const tb = Date.parse(b.sentAt ?? "") || 0;
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
            const logo =
              (shop?.logoURL as string) || (shop?.logoUrl as string) || "";
            if (logo) setShopLogoUrl(logo);
          }
        } catch (e) {
          if (
            typeof window !== "undefined" &&
            process.env.NEXT_PUBLIC_DEBUG_API === "true"
          )
            console.debug("[ShopChatPage] getShopDetail failed", e);
        }

        // if customer avatar is missing, fetch from account API
        try {
          if (!selectedRoom.userAvatarUrl && selectedRoom.userId) {
            const user = await getUserById(String(selectedRoom.userId));
            const avatar =
              (user?.avatarUrl as string) ||
              (user?.avatarURL as string) ||
              (user?.imageUrl as string) ||
              (user?.profileImageUrl as string) ||
              "";
            if (avatar) setCustomerAvatarUrl(avatar);
          }
        } catch (e) {
          if (
            typeof window !== "undefined" &&
            process.env.NEXT_PUBLIC_DEBUG_API === "true"
          )
            console.debug("[ShopChatPage] getUserById failed", e);
        }
        // refresh rooms list unread counts
        const data = await chatApi.getShopChatRooms(1, 50, null);
        if (mounted) {
          const items = (data.items ?? []).map((it: unknown) => {
            const rec = it as Record<string, unknown>;
            const id = (rec["id"] as string) ?? (rec["_id"] as string) ?? "";
            return { ...(rec as object), id } as unknown as ChatRoom;
          });
          items.sort((a, b) => {
            const ta =
              Date.parse(
                (a.lastMessage?.sentAt as string) || a.lastMessageAt || ""
              ) || 0;
            const tb =
              Date.parse(
                (b.lastMessage?.sentAt as string) || b.lastMessageAt || ""
              ) || 0;
            return tb - ta;
          });
          setRooms(items);
        }
      } catch (err) {
        console.error("init room failed", err);
      }
    };
    init();

    return () => {
      mounted = false;
      if (selectedRoom) signalRChatClient.leaveChatRoom(selectedRoom.id);
    };
  }, [selectedRoom, currentUserId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openRoom = (room: ChatRoom) => {
    setSelectedRoom(room);
  };

  const handleSend = async () => {
    if (!selectedRoom || !text.trim()) return;
    const content = text.trim();
    // optimistic
    // const optimistic: ChatMessage = {
    //   id: `temp-${Date.now()}`,
    //   chatRoomId: selectedRoom.id,
    //   // use currentUserId if available, fallback to 'shop' string for display only
    //   senderUserId: currentUserId ?? "shop",
    //   content,
    //   sentAt: new Date().toISOString(),
    //   isRead: true,
    //   isEdited: false,
    //   messageType: "Text",
    //   attachmentUrl: "",
    //   editedAt: "",
    //   senderName: "Shop",
    //   senderAvatarUrl: "",
    //   isMine: true,
    // };
    // setMessages((prev) => [...prev, optimistic]);
    setText("");

    try {
      await chatApi.sendMessage(selectedRoom.id, content, "Text");
      // server will broadcast and replace optimistic with real message when received via SignalR
    } catch (err) {
      console.error("send failed", err);
    }
  };

  const handleBack = () => {
    // Navigate back - implement your navigation logic here
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  const filteredRooms = searchText
    ? rooms.filter((room) =>
        (room.userName || room.shopName || "")
          .toLowerCase()
          .includes(searchText.toLowerCase())
      )
    : rooms;

  return (
    <div className="flex fixed top-[8%] w-[86%] h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r h-full border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              title="ArrowLeft"
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Tin nhắn</h1>
            <button
              type="button"
              title="Search"
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm cuộc trò chuyện..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
            </div>
          )}
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {filteredRooms.map((r) => {
            const name = r.userName || r.shopName || "Không tên";
            const last = r.lastMessage?.content ?? "";
            const time = formatLastSeen(
              r.lastMessage?.sentAt || r.lastMessageAt
            );
            return (
              <div
                key={r.id}
                onClick={() => openRoom(r)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${
                  selectedRoom?.id === r.id
                    ? "bg-blue-50 border-l-blue-500"
                    : "border-l-transparent"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold overflow-hidden">
                      {r.userAvatarUrl ? (
                        <Image
                          alt="avatar"
                          src={r.userAvatarUrl}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        name.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900 truncate">
                        {name}
                      </h3>
                      <span className="text-xs text-gray-500 ml-2 shrink-0">
                        {time}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 truncate mt-1">
                      {last}
                    </p>
                  </div>

                  {r.unreadCount ? (
                    <div className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full min-w-[20px] text-center">
                      {r.unreadCount}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-white h-full overflow-hidden">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {customerAvatarUrl || selectedRoom.userAvatarUrl ? (
                        <Image
                          src={customerAvatarUrl || selectedRoom.userAvatarUrl}
                          width={40}
                          height={40}
                          alt={
                            selectedRoom.userName ||
                            selectedRoom.shopName ||
                            "User"
                          }
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold">
                          {(
                            selectedRoom.userName ||
                            selectedRoom.shopName ||
                            "U"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {selectedRoom.userName ||
                        selectedRoom.shopName ||
                        "Không tên"}
                    </h2>
                    {/* <p className="text-sm text-gray-500">
                      ID phòng: {selectedRoom.id}
                    </p> */}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div
              className="flex-1 p-3 pb-40 overflow-y-auto min-h-0"
              style={{ backgroundColor: "#f8fafc" }}
            >
              {messages.length === 0 && (
                <div className="text-center text-gray-500 text-sm">
                  Chưa có tin nhắn
                </div>
              )}
              {messages.map((m, idx) => {
                const prev = messages[idx - 1];
                const showDate =
                  !prev || dayKey(prev.sentAt) !== dayKey(m.sentAt);
                const mine = !!(
                  currentUserId &&
                  m.senderUserId &&
                  String(m.senderUserId) === String(currentUserId)
                );
                const avatar = mine
                  ? shopLogoUrl || selectedRoom.shopLogoUrl || ""
                  : customerAvatarUrl || selectedRoom.userAvatarUrl || "";

                return (
                  <React.Fragment key={m.id}>
                    {showDate && (
                      <div className="flex justify-center">
                        <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                          {new Date(m.sentAt).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                    )}

                    <div
                      className={`flex ${
                        mine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex items-end mb-5 space-x-2 max-w-[70%] ${
                          mine ? "flex-row-reverse space-x-reverse" : ""
                        }`}
                      >
                        {!mine && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {avatar ? (
                              <Image
                                alt="avatar"
                                width={32}
                                height={32}
                                src={avatar}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-semibold">
                                {(selectedRoom.userName || "U")
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            )}
                          </div>
                        )}

                        <div
                          className={`relative px-4 py-2 rounded-2xl ${
                            mine
                              ? "bg-blue-500 text-white"
                              : "bg-white border border-gray-200 text-gray-900 shadow-sm"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {m.content}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              mine ? "text-blue-100" : "text-gray-400"
                            }`}
                          >
                            {formatHHmm(m.sentAt)}
                          </p>
                        </div>

                        {mine && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {shopLogoUrl || selectedRoom.shopLogoUrl ? (
                              <Image
                                alt={selectedRoom.shopName || "shop"}
                                width={32}
                                height={32}
                                src={
                                  (shopLogoUrl ||
                                    selectedRoom.shopLogoUrl) as string
                                }
                                className="w-full h-full object-cover"
                                unoptimized
                              />
                            ) : (
                              <span className="text-xs font-semibold">
                                {(selectedRoom.shopName || "S")
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={endRef} />
            </div>

            {/* Message Input */}
            <div className="fixed bottom-0 w-[68%] p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  title="Paperclip"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Paperclip className="w-5 h-5 text-gray-500" />
                </button>
                <button
                  type="button"
                  title="Image"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ImageIcon className="w-5 h-5 text-gray-500" />
                </button>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Nhập tin nhắn..."
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-full focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    title="Smile"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <Smile className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <button
                  type="button"
                  title="Send"
                  onClick={handleSend}
                  disabled={!text.trim()}
                  className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Chọn một cuộc trò chuyện
              </h3>
              <p className="text-gray-500">
                Chọn một cuộc trò chuyện để bắt đầu nhắn tin
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
