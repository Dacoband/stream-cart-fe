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

  // Chỉ tính Customer viewers
  const viewerCount = React.useMemo(() => {
    if (!stats) return 0;

    // Nếu server trả trực tiếp customerViewers thì dùng luôn
    if (
      typeof stats.customerViewers === "number" &&
      Number.isFinite(stats.customerViewers)
    ) {
      return stats.customerViewers;
    }

    // // Nếu không, fallback sang ViewersByRole
    // const roleMap = stats.viewersByRole || {};
    // for (const [role, count] of Object.entries(roleMap)) {
    //   if (String(role).toLowerCase() === "customer") {
    //     return Number(count) || 0;
    //   }
    // }

    return 0;
  }, [stats]);

  // Lắng nghe viewer stats từ SignalR
  React.useEffect(() => {
    if (!livestreamId) return;
    let mounted = true;

    (async () => {
      try {
        await chatHubService.ensureStarted();
        // Tham gia nhóm viewers để nhận thống kê chính xác
        try {
          await chatHubService.startViewingLivestream(livestreamId);
        } catch {}
        // Optional: cũng join phòng chat nếu server phát cùng nhóm
        try {
          await chatHubService.joinLivestream(livestreamId);
        } catch {}

        chatHubService.onViewerStats((payload) => {
          if (!mounted) return;
          if (
            payload.livestreamId?.toLowerCase?.() === livestreamId.toLowerCase()
          ) {
            setStats(payload);
          }
        });
      } catch {
        // ignore errors
      }
    })();

    return () => {
      mounted = false;
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
