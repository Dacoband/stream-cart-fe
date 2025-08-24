"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bot } from "lucide-react"; // icon đẹp hơn
import { getChatBot, createChatBot } from "@/services/api/chat/chat";
import { ChatMess, ChatHistory } from "@/types/chat/chatbot";
export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ChatMess[]>([]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);
  const questions = useMemo(
    () => history.filter((m) => !!m.user_message),
    [history]
  );

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [open, history.length]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = (await getChatBot()) as ChatHistory["data"] | undefined;
      const msgs = res?.history ?? [];
      setHistory(msgs);
    } catch {
      setError("Không tải được lịch sử chat");
    } finally {
      setLoading(false);
    }
  };

  // Load when opening the widget
  useEffect(() => {
    if (!open) return;
    loadHistory();
  }, [open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);

    // Optimistic append user message
    const userMsg: ChatMess = {
      timestamp: new Date().toISOString(),
      user_message: text,
      ai_response: "",
    };
    setHistory((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const data = await createChatBot(text);
      // API: data = { response, status, metadata }
      const ai = (data?.response as string) ?? "";
      const aiMsg: ChatMess = {
        timestamp: new Date().toISOString(),
        user_message: "",
        ai_response: ai,
      };
      setHistory((prev) => [...prev, aiMsg]);
    } catch {
      setError("Gửi tin nhắn thất bại");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Nút ChatBot nổi */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 flex items-center justify-center
                   rounded-full shadow-lg transition-all duration-300
                   bg-gradient-to-r from-[#B0F847] to-[#8AD62F]
                   hover:scale-110 hover:rotate-6"
      >
        <Bot className="w-7 h-7 text-black" />
      </button>

      {/* Hộp chat */}
      {open && (
        <div className="fixed bottom-20 right-5 w-[28rem] h-96 bg-white shadow-xl rounded-xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#B0F847] to-[#8AD62F] p-3 text-black font-bold flex justify-between items-center">
            <span>ChatBot</span>
            <button
              onClick={() => setOpen(false)}
              className="text-black font-bold"
            >
              ✖
            </button>
          </div>

          {/* Nội dung: Sidebar lịch sử + Khung chat */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar lịch sử câu hỏi */}
            <div className="w-36 border-r border-gray-200 flex flex-col overflow-hidden">
              <div className="px-3 py-2 text-[12px] font-semibold text-gray-600 bg-gray-50">
                Lịch sử
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1 text-[12px]">
                {questions.length === 0 && !loading && !error && (
                  <div className="text-gray-400">Chưa có câu hỏi</div>
                )}
                {questions.map((q, i) => (
                  <button
                    key={`q-${i}`}
                    type="button"
                    title={q.user_message}
                    onClick={() => setInput(q.user_message)}
                    className={`w-full text-left p-2 rounded hover:bg-gray-100 border border-transparent ${
                      input.trim() === q.user_message?.trim()
                        ? "bg-gray-100 border-gray-200"
                        : ""
                    }`}
                  >
                    <div className="line-clamp-2 break-words text-gray-700">
                      {q.user_message}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">
                      {new Date(q.timestamp).toLocaleTimeString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Khung chat chính */}
            <div className="flex-1 flex flex-col">
              <div
                ref={listRef}
                className="flex-1 p-3 overflow-y-auto text-sm space-y-2"
              >
                {loading && (
                  <div className="text-center text-xs text-gray-500">
                    Đang tải...
                  </div>
                )}
                {error && (
                  <div className="text-center text-xs text-red-500">
                    {error}
                  </div>
                )}
                {!loading && history.length === 0 && !error && (
                  <div className="self-start bg-gray-200 p-2 rounded-lg w-fit max-w-[70%]">
                    Xin chào, mình có thể giúp gì cho bạn? 🤖
                  </div>
                )}
                {history.map((m, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    {m.user_message && (
                      <div className="self-end bg-[#B0F847] p-2 rounded-lg w-fit max-w-[70%] break-words">
                        {m.user_message}
                      </div>
                    )}
                    {m.ai_response && (
                      <div className="self-start bg-gray-200 p-2 rounded-lg w-fit max-w-[70%] break-words">
                        {m.ai_response}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Ô nhập tin nhắn */}
              <div className="p-2 border-t flex">
                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B0F847]"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="ml-2 px-3 py-2 bg-gradient-to-r from-[#B0F847] to-[#8AD62F] rounded-lg text-black font-semibold disabled:opacity-60"
                >
                  {sending ? "Đang gửi..." : "Gửi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
