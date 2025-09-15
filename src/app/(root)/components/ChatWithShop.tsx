"use client";

import React, { useEffect, useRef, useState } from "react";
import { MessageCircleMore, Search } from "lucide-react";
import { ChatProvider, useChat } from "../../../lib/ChatContext";
import { getShopDetail } from "@/services/api/shop/shop";
import chatApi from "@/services/api/chat/chatApiService";
import Image from "next/image";
import { useAuth } from "@/lib/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

export type ChatWithShopProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  shopId: string;
  selectedShopId?: string;
  setSelectedShopId?: (id: string) => void;
};

function ChatWithShopInner({
  open,
  setOpen,
  shopId,
  setSelectedShopId: setActiveShopFromProps,
}: ChatWithShopProps) {
  const { messages, sendMessage, setTyping } = useChat();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [myAvatarUrl, setMyAvatarUrl] = useState<string | undefined>(undefined);
  const [shopLogoUrl, setShopLogoUrl] = useState<string | undefined>(undefined);
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  type ChatRoom = {
    id: string;
    shopId: string;
    shopName: string;
    lastMessage?: {
      id: string;
      chatRoomId: string;
      senderUserId: string;
      content: string;
      sentAt: string;
      isRead: boolean;
      isEdited: boolean;
      messageType: string;
      attachmentUrl: string | null;
      editedAt: string | null;
      senderName: string | null;
      senderAvatarUrl: string | null;
      isMine: boolean;
    } | null;
  };
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>(shopId);
  const [searchText, setSearchText] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(false);

  useEffect(() => {
    if (!open || rooms.length > 0) return;
    let mounted = true;
    setLoadingRooms(true);
    (async () => {
      try {
        const res = await chatApi.getChatRooms(1, 50, null);
        if (!mounted) return;
        const payload = res as { items?: unknown[] } | undefined;
        const rawItems = payload?.items ?? [];
        const items = (rawItems as unknown[]).map((it) => {
          const rec = it as Record<string, unknown>;
          const id = String(rec["id"] ?? rec["_id"] ?? "");
          const shopIdVal = rec["shopId"] ?? rec["ShopId"] ?? "";
          const shopNameVal = rec["shopName"] ?? rec["ShopName"] ?? "";

          // normalize lastMessage if present
          const lm = rec["lastMessage"] as
            | Record<string, unknown>
            | null
            | undefined;
          let lastMessage: ChatRoom["lastMessage"] | null = null;
          if (lm && typeof lm === "object") {
            const lmRec = lm as Record<string, unknown>;
            lastMessage = {
              id: String(lmRec["id"] ?? lmRec["_id"] ?? ""),
              chatRoomId: String(lmRec["chatRoomId"] ?? lmRec["roomId"] ?? ""),
              senderUserId: String(
                lmRec["senderUserId"] ?? lmRec["senderId"] ?? ""
              ),
              content: String(lmRec["content"] ?? lmRec["message"] ?? ""),
              sentAt: String(lmRec["sentAt"] ?? lmRec["timestamp"] ?? ""),
              isRead: Boolean(lmRec["isRead"] ?? false),
              isEdited: Boolean(lmRec["isEdited"] ?? false),
              messageType: String(lmRec["messageType"] ?? "Text"),
              attachmentUrl: lmRec["attachmentUrl"]
                ? String(lmRec["attachmentUrl"])
                : null,
              editedAt: lmRec["editedAt"] ? String(lmRec["editedAt"]) : null,
              senderName: lmRec["senderName"]
                ? String(lmRec["senderName"])
                : null,
              senderAvatarUrl: lmRec["senderAvatarUrl"]
                ? String(lmRec["senderAvatarUrl"])
                : null,
              isMine: Boolean(lmRec["isMine"] ?? false),
            };
          }

          return {
            id,
            shopId: String(shopIdVal ?? ""),
            shopName: String(shopNameVal ?? ""),
            lastMessage,
          } as ChatRoom;
        });
        setRooms(items);
        // debug
        console.log("[ChatWithShop] loaded rooms count", items.length);
      } catch (err) {
        console.error("[ChatWithShop] getChatRooms failed", err);
      } finally {
        if (mounted) setLoadingRooms(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [open, rooms.length]);

  useEffect(() => {
    if (shopId) setSelectedShopId(shopId);
  }, [shopId]);

  useEffect(() => {
    listRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined" ? localStorage.getItem("userData") : null;
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        setCurrentUserId((parsed.id as string) ?? null);
        const avatar =
          (parsed["avatarUrl"] as string) ||
          (parsed["avatarURL"] as string) ||
          (parsed["imageUrl"] as string) ||
          (parsed["profileImageUrl"] as string) ||
          (parsed["avatar"] as string) ||
          "";
        if (avatar) setMyAvatarUrl(avatar);
      }
    } catch {
      setCurrentUserId(null);
    }
  }, []);

  useEffect(() => {
    if (!selectedShopId) return;
    let mounted = true;
    (async () => {
      try {
        const shop = await getShopDetail(selectedShopId);
        const logo =
          (shop?.logoURL as string) || (shop?.logoUrl as string) || "";
        if (mounted && logo) setShopLogoUrl(logo);
      } catch (e) {
        if (
          typeof window !== "undefined" &&
          process.env.NEXT_PUBLIC_DEBUG_API === "true"
        )
          console.debug("[ChatWithShop] getShopDetail failed", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedShopId]);

  const onSend = async () => {
    if (!text.trim()) return;
    await sendMessage(text.trim());
    setText("");
    await setTyping(false);
  };

  // Lọc phòng theo search
  const filteredRooms = searchText
    ? rooms.filter((room) =>
        (room.shopName || "").toLowerCase().includes(searchText.toLowerCase())
      )
    : rooms;

  const handleChatToggle = () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập.");
      router.push(
        `/authentication/login?redirect=${encodeURIComponent(pathname || "/")}`
      );
      return;
    }
    setOpen(!open);
  };

  return (
    <>
      <button
        type="button"
        title="Chat With Shop"
        onClick={handleChatToggle}
        className={`fixed bottom-5 right-5 z-50 w-14 h-14 flex items-center justify-center
                  rounded-full shadow-lg transition-all duration-300
                  hover:scale-110 hover:rotate-6
                  ${
                    open
                      ? "bg-gradient-to-r from-[#FFD700] to-[#FFA500]"
                      : "bg-gradient-to-r from-[#B0F847] to-[#8AD62F]"
                  }`}
      >
        <MessageCircleMore className="w-7 h-7 text-black" />
      </button>

      {open && (
        <div className="fixed bottom-5 right-22 w-[40rem] h-[55%] bg-white shadow-xl z-50 flex flex-col overflow-hidden rounded-t-xl rounded-l-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#B0F847] to-[#8AD62F] p-3 text-black font-bold flex justify-between items-center">
            <span>Tin nhắn</span>
            <button
              onClick={() => setOpen(false)}
              className="text-black font-bold"
            >
              ✖
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar danh sách shop đã chat - UI giống page shop chat */}
            <div className="w-64 border-r border-gray-200 flex flex-col overflow-hidden bg-gray-50">
              <div className="flex-shrink-0 p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm cuộc trò chuyện..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto min-h-0">
                {loadingRooms ? (
                  <div className="text-center text-gray-400 text-xs my-4">
                    Đang tải...
                  </div>
                ) : filteredRooms.length === 0 ? (
                  <div className="text-center text-gray-400 text-xs my-4">
                    Không có shop nào
                  </div>
                ) : (
                  filteredRooms.map((room) => (
                    <button
                      key={room.id}
                      className={`w-full text-left p-3 border-b cursor-pointer border-gray-100 hover:bg-gray-100 ${
                        selectedShopId === room.shopId ? "bg-gray-200" : ""
                      }`}
                      onClick={() => {
                        if (typeof setActiveShopFromProps === "function") {
                          setActiveShopFromProps(room.shopId);
                        }
                        setSelectedShopId(room.shopId);
                      }}
                    >
                      <div className="font-medium truncate">
                        {room.shopName}
                      </div>
                      <div
                        className={`text-[10px] mt-1 ${
                          room ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        {new Date(
                          room.lastMessage?.sentAt ?? ""
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat chính */}
            <div className="flex-1 flex flex-col">
              <div
                className="flex-1 items-center justify-center p-3 w-full overflow-y-auto"
                style={{ minHeight: 0 }}
              >
                <div className="min-h-full flex flex-col justify-end">
                  {messages.map((m, idx) => {
                    const prev = messages[idx - 1];
                    const showDate =
                      !prev ||
                      new Date(prev.sentAt).toDateString() !==
                        new Date(m.sentAt).toDateString();
                    const mine = !!(
                      currentUserId &&
                      m.senderUserId &&
                      String(m.senderUserId) === String(currentUserId)
                    );
                    const avatar = mine ? myAvatarUrl : shopLogoUrl;
                    return (
                      <React.Fragment key={m.id}>
                        {showDate && (
                          <div className="text-center text-[11px] text-gray-400 my-2">
                            {new Date(m.sentAt).toLocaleDateString()}
                          </div>
                        )}
                        <div
                          className={`flex items-end mb-2 ${
                            mine ? "justify-end" : "justify-start"
                          }`}
                        >
                          {!mine && (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 overflow-hidden">
                              {avatar ? (
                                <Image
                                  alt="avatar"
                                  src={avatar}
                                  width={32}
                                  height={32}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-xs font-semibold">S</span>
                              )}
                            </div>
                          )}
                          <div
                            className={`max-w-[70%] px-3 py-2 rounded-2xl ${
                              mine
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <div className="whitespace-pre-wrap break-words">
                              {m.content}
                            </div>
                            <div
                              className={`text-[10px] mt-1 ${
                                mine ? "text-blue-100" : "text-gray-400"
                              }`}
                            >
                              {new Date(m.sentAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                          {mine && (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-2 overflow-hidden">
                              {avatar ? (
                                <Image
                                  alt="avatar"
                                  src={avatar}
                                  width={32}
                                  height={32}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-xs font-semibold">U</span>
                              )}
                            </div>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={listRef} />
                </div>
              </div>
              <div className="p-3 border-t flex gap-2">
                <input
                  className="flex-1 border rounded-full px-4 py-2"
                  placeholder="Nhập tin nhắn..."
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setTyping(!!e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSend();
                  }}
                />
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-full"
                  onClick={onSend}
                >
                  Gửi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const ChatWithShop: React.FC<ChatWithShopProps> = (props) => {
  const [activeShopId, setActiveShopId] = useState<string>(props.shopId ?? "");
  useEffect(() => {
    if (props.shopId && props.shopId !== activeShopId) {
      setActiveShopId(props.shopId);
    }
  }, [props.shopId, activeShopId]);
  return (
    <ChatProvider shopId={activeShopId || ""}>
      <ChatWithShopInner
        {...props}
        setSelectedShopId={setActiveShopId}
        selectedShopId={activeShopId}
      />
    </ChatProvider>
  );
};

export default ChatWithShop;
