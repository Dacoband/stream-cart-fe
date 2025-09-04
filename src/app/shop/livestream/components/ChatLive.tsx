import React from "react";
// import { SendChatSignalR } from "@/types/livestream/chatSignalR";
import {
  chatHubService,
  LivestreamMessagePayload,
} from "@/services/signalr/chatHub";
import { getChatLiveStream } from "@/services/api/livestream/chatsignalR";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Store, UserRound } from "lucide-react";
import Image from "next/image";
// import { useAuth } from "@/lib/AuthContext";
import { getLivestreamById } from "@/services/api/livestream/livestream";
import { useRouter } from "next/navigation";

function ChatLive({
  livestreamId,
  disabledInput = false,
}: {
  livestreamId: string;
  disabledInput?: boolean;
}) {
  const router = useRouter();
  // const { user } = useAuth();
  const [newMessage, setNewMessage] = React.useState("");
  const [messages, setMessages] = React.useState<LivestreamMessagePayload[]>(
    []
  );

  const [loading, setLoading] = React.useState(true);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  // Track seen messages to prevent duplicates from double broadcasts or duplicate handlers
  const seenKeysRef = React.useRef<Set<string>>(new Set());
  const [sellerId, setSellerId] = React.useState<string | null>(null);
  // Avoid multiple navigations on repeated warnings
  const navigatedRef = React.useRef<boolean>(false);

  const makeKey = React.useCallback((m: LivestreamMessagePayload) => {
    const ts = m.timestamp ? new Date(m.timestamp).getTime() : Date.now();
    return `${m.senderId || ""}|${(m.message || "").trim()}|${ts}`;
  }, []);

  // Always scroll to bottom when messages change
  React.useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Initial fetch (REST) + join hub
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // Fetch sellerId to mark shop messages with store icon
        try {
          const live = await getLivestreamById(livestreamId);
          if (mounted) setSellerId(live?.sellerId || live?.shopId || null);
        } catch {}
        // Load existing history via REST (paginated wrapper: { currentPage, items: [] })
        interface HistoryItem {
          id: string;
          livestreamId: string;
          senderId: string;
          senderName: string;
          senderType?: string;
          message: string;
          messageType?: number;
          replyToMessageId?: string | null;
          isModerated?: boolean;
          sentAt?: string;
          createdAt?: string;
          senderAvatarUrl?: string;
          replyToMessage?: string;
          replyToSenderName?: string;
          timestamp?: string;
        }
        interface HistoryPage {
          currentPage: number;
          pageSize: number;
          totalCount: number;
          totalPages: number;
          hasPrevious: boolean;
          hasNext: boolean;
          items: HistoryItem[];
        }
        const historyWrapper: HistoryPage | null = await getChatLiveStream(
          livestreamId
        ).catch(() => null);
        if (mounted && historyWrapper && Array.isArray(historyWrapper.items)) {
          const mapped: LivestreamMessagePayload[] = historyWrapper.items.map(
            (h: HistoryItem) => ({
              senderId: h.senderId || "",
              senderName: h.senderName || "Anonymous",
              message: h.message || "",
              senderType: h.senderType,
              senderAvatarUrl: h.senderAvatarUrl,
              timestamp:
                h.sentAt ||
                h.createdAt ||
                h.timestamp ||
                new Date().toISOString(),
            })
          );
          // Ensure chronological order if backend returns newest first
          mapped.sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          setMessages(mapped);
          // seed dedupe set so live events matching history won't duplicate
          const seen = seenKeysRef.current;
          for (const m of mapped) {
            try {
              seen.add(makeKey(m));
            } catch {
              /* ignore */
            }
          }

          // Scroll xuống cuối sau khi load lịch sử
          requestAnimationFrame(() => {
            if (listRef.current) {
              listRef.current.scrollTop = listRef.current.scrollHeight;
            }
          });
        }

        await chatHubService.ensureStarted();
        // Seller should not be counted as a viewer
        await chatHubService.joinLivestream(livestreamId);

        chatHubService.onReceiveLivestreamMessage(async (payload) => {
          // de-dupe: skip if already seen
          try {
            const key = makeKey(payload);
            if (seenKeysRef.current.has(key)) return;
            seenKeysRef.current.add(key);
          } catch {
            /* ignore */
          }
          setMessages((prev) => [...prev, payload]);
          // Auto scroll
          requestAnimationFrame(() => {
            if (listRef.current) {
              listRef.current.scrollTop = listRef.current.scrollHeight;
            }
          });

          // Detect zero-GUID system sender and redirect if livestream ended
          try {
            const isZeroGuid =
              (payload.senderId || "").toLowerCase() ===
              "00000000-0000-0000-0000-000000000000";
            if (isZeroGuid && !navigatedRef.current) {
              // Re-check livestream status from server
              const live = await getLivestreamById(livestreamId);
              const status = (live as unknown as { status?: boolean })?.status;
              if (status === false) {
                navigatedRef.current = true;
                router.push(
                  `/shop/livestream/${livestreamId}/review-livestream`
                );
              }
            }
          } catch {
            // ignore
          }
        });
      } catch (e) {
        console.error("Chat init error", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
      chatHubService.leaveLivestream(livestreamId);
    };
  }, [livestreamId, makeKey, router]);

  const handleMessageSend = async () => {
    if (disabledInput) return;
    if (!newMessage.trim()) return;
    const text = newMessage.trim();
    try {
      // Send via SignalR only; avoid REST to prevent double-broadcasting
      await chatHubService.sendLivestreamMessage(livestreamId, text);
      // Clear input only after successful send so UI waits for realtime event to render message
      setNewMessage("");
    } catch (e) {
      console.error("Send message failed", e);
    }
  };

  return (
    <Card className="bg-white border  flex flex-col h-full rounded-none py-0 gap-0">
      <CardTitle className="border-b py-4 text-black text-center">
        Chat Live
      </CardTitle>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <div className="flex flex-col h-full">
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto w-full  overflow-x-hidden px-3 py-2 space-y-3.5 text-sm"
          >
            {loading && (
              <div className="text-center text-gray-400 text-xs">
                Đang tải đoạn chat...
              </div>
            )}
            {!loading && messages.length === 0 && (
              <div className="text-center text-gray-400 text-xs">
                Chưa có tin nhắn
              </div>
            )}
            {messages.map((m, idx) => (
              <div key={idx} className="flex items-start gap-2">
                {/* Avatar / Icon */}
                {m.senderType === "Shop" ||
                m.senderType === "Moderator" ||
                (sellerId && m.senderId === sellerId) ? (
                  <div className="h-6 w-6 flex items-center justify-center rounded-full bg-lime-100 overflow-hidden shrink-0">
                    <Store className="h-4 w-4 text-lime-500" />
                  </div>
                ) : m.senderAvatarUrl ? (
                  <Image
                    src={m.senderAvatarUrl}
                    alt={m.senderName || "User"}
                    className="h-6 w-6 object-cover rounded-full"
                    width={24}
                    height={24}
                  />
                ) : (
                  <div className="h-6 w-6 flex items-center justify-center rounded-full bg-gray-100 overflow-hidden shrink-0">
                    <UserRound className="h-4 w-4 text-gray-500" />
                  </div>
                )}

                {/* Message */}
                <div className="flex-1 text-[13px] leading-snug break-words whitespace-pre-line">
                  <span className="text-slate-500 font-semibold mr-1">
                    {m.senderName}:
                  </span>
                  {m.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="py-4 border-t h-fit">
        <div className="relative w-full">
          <textarea
            rows={3}
            placeholder={
              disabledInput
                ? "Livestream chưa bắt đầu - Chat tạm khóa"
                : "Nhập tin nhắn..."
            }
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (!disabledInput && e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleMessageSend();
              }
            }}
            disabled={disabledInput}
            aria-disabled={disabledInput}
            className={`w-full pb-5 border rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-400 ${
              disabledInput ? "opacity-60 cursor-not-allowed bg-gray-50" : ""
            }`}
          />
          <Button
            type="button"
            onClick={handleMessageSend}
            aria-label="Gửi tin nhắn"
            disabled={disabledInput}
            className={`absolute bottom-2 right-1 bg-white hover:bg-white text-lime-600 p-0 flex items-center justify-center ${
              disabledInput ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <Send size={32} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default ChatLive;
