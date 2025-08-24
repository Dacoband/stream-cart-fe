"use client";

import React, { useEffect, useRef, useState } from "react";
import { useChat } from "../../../../lib/ChatContext";
import { getShopDetail } from "@/services/api/shop/shop";

const ChatUI: React.FC = () => {
  const { messages, sendMessage, setTyping, connected } = useChat();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [myAvatarUrl, setMyAvatarUrl] = useState<string | undefined>();
  const [shopLogoUrl, setShopLogoUrl] = useState<string | undefined>();
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
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

  // fetch shop logo
  useEffect(() => {
    const qsShopId =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("shopId")
        : null;
    if (!qsShopId) return;
    let mounted = true;
    (async () => {
      try {
        const shop = await getShopDetail(qsShopId);
        const logo =
          (shop?.logoURL as string) || (shop?.logoUrl as string) || "";
        if (mounted && logo) setShopLogoUrl(logo);
      } catch (e) {
        if (
          typeof window !== "undefined" &&
          process.env.NEXT_PUBLIC_DEBUG_API === "true"
        )
          console.debug("[CustomerChat] getShopDetail failed", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onSend = async () => {
    if (!text.trim()) return;
    await sendMessage(text.trim());
    setText("");
    await setTyping(false);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <main className="flex-1 flex flex-col max-w-3xl mx-auto">
        {/* header */}
        <div className="p-4 border-b">
          <div className="font-semibold">Trò chuyện với Shop</div>
          <div
            className={`text-xs ${
              connected ? "text-green-600" : "text-red-600"
            }`}
          >
            {connected ? "Đã kết nối" : "Mất kết nối"}
          </div>
        </div>

        {/* messages */}
        <div className="flex-1 overflow-auto">
          <div className="min-h-full flex flex-col justify-end p-4">
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
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt="avatar"
                            src={avatar}
                            className="w-full h-full object-cover"
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
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt="avatar"
                            src={avatar}
                            className="w-full h-full object-cover"
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
            <div ref={endRef} />
          </div>
        </div>

        {/* input */}
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
      </main>
    </div>
  );
};

export default ChatUI;
