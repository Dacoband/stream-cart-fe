"use client";

import React, { useEffect, useRef, useState } from "react";
import { MessageCircleMore } from "lucide-react";

interface ChatMess {
  timestamp: string;
  user_message?: string;
  ai_response?: string;
}

interface Shop {
  id: string;
  name: string;
}

interface ChatWithShopProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const mockShops: Shop[] = [
  { id: "shop1", name: "Hoàng Nhân Thiện", avatar: "https://i.pravatar.cc/40?img=12" },
  { id: "shop2", name: "Trần Ánh Tuyết", avatar: "https://i.pravatar.cc/40?img=13" },
];

const userAvatar = "https://i.pravatar.cc/40?img=5";

const mockHistory: Record<string, ChatMess[]> = {
  shop1: [
    { timestamp: "2025-08-22T04:01:00", user_message: "alo", ai_response: "haha" },
    { timestamp: "2025-08-22T04:12:00", user_message: "alo" },
    { timestamp: "2025-08-22T04:13:00", user_message: "haja" },
    { timestamp: "2025-08-22T04:13:00", user_message: "jhxdu" },
    { timestamp: "2025-08-22T04:13:00", user_message: "you can not" },
    { timestamp: "2025-08-22T04:13:00", user_message: "al" },
    { timestamp: "2025-08-22T18:26:00", user_message: "123" },
    { timestamp: "2025-08-22T00:14:00", ai_response: "haha" },
  ],
  shop2: [
    { timestamp: "2025-08-18T08:00:00", user_message: "Hello Shop B", ai_response: "Hi bạn!" },
  ],
};

export default function ChatWithShop({ open, setOpen }: ChatWithShopProps) {
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [history, setHistory] = useState<ChatMess[]>([]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selectedShopId) {
      setHistory(mockHistory[selectedShopId] || []);
    }
  }, [selectedShopId]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history.length]);

  const handleSend = () => {
    if (!input.trim() || !selectedShopId) return;
    const userMsg: ChatMess = {
      timestamp: new Date().toISOString(),
      user_message: input,
    };
    setHistory((prev) => [...prev, userMsg]);
    setInput("");
    const aiMsg: ChatMess = {
      timestamp: new Date().toISOString(),
      ai_response: "Đây là trả lời giả từ shop",
    };
    setHistory((prev) => [...prev, aiMsg]);
  };

  const renderMessages = () => {
    let lastDate = "";
    return history.map((m, idx) => {
      const msgDate = new Date(m.timestamp).toDateString();
      const showDate = lastDate !== msgDate;
      lastDate = msgDate;
      return (
        <React.Fragment key={idx}>
          {showDate && (
            <div className="text-center text-gray-400 text-xs my-2">{msgDate}</div>
          )}
          {m.user_message && (
            <div className="flex justify-end mb-2 items-end space-x-2">
              <div className="flex flex-col items-end">
                <div className="bg-blue-500 text-white p-2 rounded-lg max-w-[100%]">
                  {m.user_message}
                  <div className="text-[10px] text-blue-100 mt-1 text-right">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
              <img src={userAvatar} alt="User" className="w-8 h-8 rounded-full" />
            </div>
          )}

          {m.ai_response && (
            <div className="flex justify-start mb-2 items-end space-x-2">
              <img
                src={mockShops.find((s) => s.id === selectedShopId)?.avatar}
                alt="Shop"
                className="w-8 h-8 rounded-full"
              />
              <div className="bg-gray-200 p-2 rounded-lg max-w-[100%]">
                {m.ai_response}
                <div className="text-[10px] text-gray-500 mt-1">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <>
      <button
        type="button"
        title="Chat With Shop"
        onClick={() => setOpen(!open)}
        className={`fixed bottom-5 right-5 z-50 w-14 h-14 flex items-center justify-center
                  rounded-full shadow-lg transition-all duration-300
                  hover:scale-110 hover:rotate-6
                  ${open ? "bg-gradient-to-r from-[#FFD700] to-[#FFA500]" : "bg-gradient-to-r from-[#B0F847] to-[#8AD62F]"}`}
      >
        <MessageCircleMore className="w-7 h-7 text-black" />
      </button>

      {open && (
        <div className="fixed bottom-0 right-22 w-[40rem] h-[55%] bg-white shadow-xl z-50 flex flex-col overflow-hidden rounded-t-xl rounded-l-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#B0F847] to-[#8AD62F] p-3 text-black font-bold flex justify-between items-center">
            <span>Tin nhắn</span>
            <button onClick={() => setOpen(false)} className="text-black font-bold">
              ✖
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar danh sách shop */}
            <div className="w-48 border-r border-gray-200 flex flex-col overflow-hidden">
              <div className="px-3 py-2 text-[12px] font-semibold text-gray-600 bg-gray-50">
                Lịch sử Shop
              </div>
              <div className="flex-1 overflow-y-auto">
                {mockShops.map((shop) => (
                  <button
                    key={shop.id}
                    className={`w-full text-left p-3 border-b border-gray-100 hover:bg-gray-100 ${
                      selectedShopId === shop.id ? "bg-gray-100" : ""
                    }`}
                    onClick={() => setSelectedShopId(shop.id)}
                  >
                    <div className="font-medium">{shop.name}</div>
                    <div className="text-[10px] text-gray-400">
                      {mockHistory[shop.id]?.length
                        ? new Date(mockHistory[shop.id][mockHistory[shop.id].length - 1].timestamp).toLocaleDateString()
                        : "-"}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat chính */}
            <div className="flex-1 flex flex-col">
              <div ref={listRef} className="flex-1 p-3 overflow-y-auto">
                {!selectedShopId && (
                  <div className="text-gray-400 self-center mt-10">
                    Chọn shop để bắt đầu chat
                  </div>
                )}
                {selectedShopId && renderMessages()}
              </div>

              {selectedShopId && (
                <div className="p-2 border-t flex">
                  <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) handleSend();
                    }}
                    className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B0F847]"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="ml-2 px-3 py-2 bg-gradient-to-r from-[#B0F847] to-[#8AD62F] rounded-lg text-black font-semibold disabled:opacity-60"
                  >
                    Gửi
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
