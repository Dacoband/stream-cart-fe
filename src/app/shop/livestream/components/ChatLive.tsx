import React from "react";
import { SendChatSignalR } from "@/types/livestream/chatSignalR";
import {
  chatHubService,
  LivestreamMessagePayload,
  ViewerStatsPayload,
} from "@/services/signalr/chatHub";
import {
  getChatLiveStream,
  SendMessageLiveStream,
} from "@/services/api/livestream/chatsignalR";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

function ChatLive({ livestreamId }: { livestreamId: string }) {
  const [newMessage, setNewMessage] = React.useState("");
  const [messages, setMessages] = React.useState<LivestreamMessagePayload[]>(
    []
  );
  const [viewerStats, setViewerStats] =
    React.useState<ViewerStatsPayload | null>(null);
  const [loading, setLoading] = React.useState(true);
  const listRef = React.useRef<HTMLDivElement | null>(null);

  // Initial fetch (REST) + join hub
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
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
          timestamp?: string; // fallback naming
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
        }

        await chatHubService.ensureStarted();
        await chatHubService.joinLivestream(livestreamId);

        chatHubService.onReceiveLivestreamMessage((payload) => {
          setMessages((prev) => [...prev, payload]);
          // Auto scroll
          requestAnimationFrame(() => {
            if (listRef.current) {
              listRef.current.scrollTop = listRef.current.scrollHeight;
            }
          });
        });
        chatHubService.onViewerStats((stats) => setViewerStats(stats));
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
  }, [livestreamId]);

  const handleMessageSend = async () => {
    if (!newMessage.trim()) return;
    const text = newMessage.trim();
    setNewMessage("");
    try {
      // Optimistic add
      const optimistic: LivestreamMessagePayload = {
        senderId: "me",
        senderName: "Me",
        message: text,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);
      requestAnimationFrame(() => {
        if (listRef.current)
          listRef.current.scrollTop = listRef.current.scrollHeight;
      });
      await chatHubService.sendLivestreamMessage(livestreamId, text);
      // Optionally also call REST if server doesn't persist SignalR messages directly
      const data: SendChatSignalR = {
        livestreamId,
        message: text,
        messageType: 0,
        replyToMessageId: null,
      };
      SendMessageLiveStream(livestreamId, data).catch(() => {});
    } catch (e) {
      console.error("Send message failed", e);
    }
  };

  return (
    <Card className="bg-white border h-full rounded-none py-0 gap-0">
      <CardTitle className="border-b py-4 text-black text-center">
        Chat Live
      </CardTitle>
      <CardContent className="p-0">
        <div className="flex flex-col h-[400px]">
          <div className="px-3 py-2 border-b text-xs text-gray-600 flex justify-between">
            <span>
              {viewerStats
                ? `Viewers: ${viewerStats.totalViewers}`
                : "Connecting..."}
            </span>
            {viewerStats && (
              <span className="text-[10px]">
                {Object.entries(viewerStats.viewersByRole || {})
                  .map(([r, c]) => `${r}:${c}`)
                  .join(" ")}
              </span>
            )}
          </div>
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto px-3 py-2 space-y-2 text-sm"
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
              <div key={idx} className="flex flex-col">
                <span className="text-[11px] font-medium text-blue-600">
                  {m.senderName}
                </span>
                <span className="whitespace-pre-wrap break-words">
                  {m.message}
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5">
                  {new Date(m.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="py-4 border-t">
        <div className="w-full flex items-end gap-2">
          <textarea
            rows={4}
            placeholder="Nhập tin nhắn..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleMessageSend();
              }
            }}
            className="flex-1 border rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            variant="default"
            size="icon"
            className="h-10 w-10"
            onClick={handleMessageSend}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default ChatLive;
