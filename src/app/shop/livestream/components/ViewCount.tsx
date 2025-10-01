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

  const viewerCount = React.useMemo(() => {
    if (!stats) return 0;

    if (
      typeof stats.totalViewers === "number" &&
      Number.isFinite(stats.totalViewers)
    ) {
      return stats.totalViewers;
    }

    const roleMap: Record<string, number> = stats.viewersByRole || {};
    return Object.values(roleMap).reduce((sum, v) => sum + (Number(v) || 0), 0);
  }, [stats]);

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

        // Fallback polling nhẹ để làm tươi nếu thiếu sự kiện (tùy chọn)
        pollTimer = setInterval(() => {
          chatHubService.requestViewerStats(livestreamId).catch(() => {});
        }, 10000);
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
    <div className="flex ml-2">
      <Button className="bg-rose-600 text-white rounded-none hover:bg-rose-600 flex items-center relative overflow-visible">
        <span className="relative mr-2 flex items-center justify-center">
          <span className="absolute h-4 w-4 rounded-full bg-white opacity-75 animate-ping" />
          <span className="h-3 w-3 rounded-full bg-white" />
        </span>
        Live
      </Button>

      <Button className="rounded-none flex items-center gap-1">
        <UserRound className="w-4 h-4" />
        {viewerCount}
      </Button>
    </div>
  );
}
