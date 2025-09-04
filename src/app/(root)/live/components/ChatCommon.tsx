import React from "react";
// import { SendChatSignalR } from "@/types/livestream/chatSignalR";
import {
  chatHubService,
  LivestreamMessagePayload,
} from "@/services/signalr/chatHub";
import { getChatLiveStream } from "@/services/api/livestream/chatsignalR";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Store, UserRound } from "lucide-react";
import Image from "next/image";
import { getLivestreamById } from "@/services/api/livestream/livestream";

interface ChatCommonProps {
  livestreamId?: string; // Optional: if not provided, component shows placeholder
  heightClass?: string; // allow override height
}

const ChatCommon: React.FC<ChatCommonProps> = ({ livestreamId }) => {
  const [newMessage, setNewMessage] = React.useState("");
  const [messages, setMessages] = React.useState<LivestreamMessagePayload[]>(
    []
  );
  const [loading, setLoading] = React.useState(false);
  const [sellerId, setSellerId] = React.useState<string | null>(null);
  const reloadedRef = React.useRef<boolean>(false);

  const listRef = React.useRef<HTMLDivElement | null>(null);
  const seenKeysRef = React.useRef<Set<string>>(new Set());
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

  React.useEffect(() => {
    if (!livestreamId) return; // wait until id available
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // Fetch sellerId once to tag shop messages in realtime even if senderType is missing
        try {
          const live = await getLivestreamById(livestreamId);
          if (mounted) setSellerId(live?.sellerId || live?.shopId || null);
        } catch {}

        interface HistoryItem {
          id: string;
          livestreamId: string;
          senderId: string;
          senderName: string;
          senderType?: string;
          message: string;
          sentAt?: string;
          createdAt?: string;
          timestamp?: string;
          senderAvatarUrl?: string;
        }
        interface HistoryPage {
          items: HistoryItem[];
        }
        const historyWrapper: HistoryPage | null = await getChatLiveStream(
          livestreamId
        ).catch(() => null);
        if (mounted && historyWrapper?.items) {
          const mapped: LivestreamMessagePayload[] = historyWrapper.items
            .map((h) => ({
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
            }))
            .sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
            );
          setMessages(mapped);
          // seed dedupe
          const seen = seenKeysRef.current;
          for (const m of mapped) {
            try {
              seen.add(makeKey(m));
            } catch {
              /* ignore */
            }
          }
        }
        await chatHubService.ensureStarted();
        // Mark this client as an active viewer for stats
        await chatHubService.startViewingLivestream(livestreamId);
        await chatHubService.joinLivestream(livestreamId);
        chatHubService.onReceiveLivestreamMessage(async (payload) => {
          try {
            const key = makeKey(payload);
            if (seenKeysRef.current.has(key)) return;
            seenKeysRef.current.add(key);
          } catch {
            /* ignore */
          }
          setMessages((prev) => [...prev, payload]);
          requestAnimationFrame(() => {
            if (listRef.current)
              listRef.current.scrollTop = listRef.current.scrollHeight;
          });

          // If system (zero-GUID) sender warns, check status and reload once if ended
          try {
            const isZeroGuid =
              (payload.senderId || "").toLowerCase() ===
              "00000000-0000-0000-0000-000000000000";
            if (isZeroGuid && !reloadedRef.current) {
              const live = await getLivestreamById(livestreamId);
              const status = (live as unknown as { status?: boolean })?.status;
              if (status === false) {
                reloadedRef.current = true;
                window.location.reload();
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
      chatHubService.stopViewingLivestream(livestreamId);
      chatHubService.leaveLivestream(livestreamId);
    };
  }, [livestreamId, makeKey]);

  const handleMessageSend = async () => {
    if (!livestreamId) return;
    if (!newMessage.trim()) return;
    const text = newMessage.trim();
    try {
      // Only SignalR to avoid duplicate echoes
      await chatHubService.sendLivestreamMessage(livestreamId, text);
      setNewMessage("");
    } catch (e) {
      console.error("Send message failed", e);
    }
  };

  if (!livestreamId) {
    return (
      <div className="flex flex-col items-center justify-center text-xs text-gray-500 py-4">
        Chưa có livestream đang mở
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full min-h-0">
      <CardContent className="p-0 flex-1 overflow-hidden min-h-0">
        <div className={`flex flex-col h-full min-h-0`}>
          <div
            ref={listRef}
            className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden  custom-scroll w-full  px-3 py-2 space-y-3.5 text-sm"
          >
            {loading && (
              <div className="text-center text-gray-400 text-xs">
                Đang tải...
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
      <CardFooter className="py-4 border-t h-fit mt-auto sticky bottom-0 bg-white">
        <div className="relative w-full">
          <textarea
            rows={3}
            placeholder="Nhập tin nhắn..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleMessageSend();
              }
            }}
            className="w-full pr-20 border rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <Button
            type="button"
            onClick={handleMessageSend}
            aria-label="Gửi tin nhắn"
            className="absolute bottom-2 right-1 bg-white hover:bg-white text-lime-600 cursor-pointer p-0 flex items-center justify-center"
            disabled={!newMessage.trim()}
          >
            <Send size={32} />
          </Button>
        </div>
      </CardFooter>
    </div>
  );
};

export default ChatCommon;
