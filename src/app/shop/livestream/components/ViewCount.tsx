"use client";

import { Button } from "@/components/ui/button";
import { UserRound } from "lucide-react";
import React from "react";
import { chatHubService, ViewerStatsPayload } from "@/services/signalr/chatHub";

interface ViewerCountProps {
  livestreamId?: string;
}

export function ViewerCount({ livestreamId }: ViewerCountProps) {
  const [stats, setStats] = React.useState<ViewerStatsPayload | null>(null);

  React.useEffect(() => {
    if (!livestreamId) return;
    let mounted = true;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    (async () => {
      try {
        await chatHubService.ensureStarted();
        try {
          await chatHubService.startViewingLivestream(livestreamId);
        } catch {}
        try {
          await chatHubService.joinLivestream(livestreamId);
        } catch {}

        // Yêu cầu server phát lại thống kê ngay khi kết nối
        // Ask the server to push current stats (if supported)
        try {
          await chatHubService.requestViewerStats(livestreamId);
        } catch {}

        chatHubService.onViewerStats((payload) => {
          if (!mounted) return;
          if (
            payload.livestreamId?.toLowerCase?.() === livestreamId.toLowerCase()
          ) {
            setStats(payload);
          }
        });

        // Optional: listen to ViewingStarted confirmation to know we're grouped
        chatHubService.onViewingStarted((p) => {
          if (!mounted) return;
          if (p?.message) console.log("[SignalR] ViewingStarted:", p.message);
        });

        // Light fallback (seldom) to refresh if an event is missed
        pollTimer = setInterval(() => {
          chatHubService.requestViewerStats(livestreamId).catch(() => {});
        }, 3000);

        // When users join/leave chat room, ask for a fresh stat (server may or may not implement RequestViewerStats)
        chatHubService.onUserJoined(() => {
          chatHubService.requestViewerStats(livestreamId).catch(() => {});
        });
        chatHubService.onUserLeft(() => {
          chatHubService.requestViewerStats(livestreamId).catch(() => {});
        });
      } catch {
        // ignore errors
      }
    })();

    return () => {
      mounted = false;
      if (pollTimer) clearInterval(pollTimer);
      // Rời nhóm viewers để tránh rò rỉ sự kiện
      try {
        chatHubService.stopViewingLivestream(livestreamId);
      } catch {}
      try {
        chatHubService.leaveLivestream(livestreamId);
      } catch {}
    };
  }, [livestreamId]);

  return (
    <div className="flex ml-2 items-center gap-2">
      <Button className="bg-rose-600 text-white rounded-none hover:bg-rose-600 flex items-center relative overflow-visible">
        <span className="relative mr-2 flex items-center justify-center">
          <span className="absolute h-4 w-4 rounded-full bg-white opacity-75 animate-ping" />
          <span className="h-3 w-3 rounded-full bg-white" />
        </span>
        Live
      </Button>

      <Button className="rounded-none flex items-center gap-1">
        <UserRound className="w-4 h-4" />
        {typeof stats?.customerViewers === "number" &&
          Number.isFinite(stats.customerViewers) && (
            <span className="">{stats.customerViewers}</span>
          )}
      </Button>
    </div>
  );
}
