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
  // Debug flag (set NEXT_PUBLIC_LIVESTREAM_DEBUG=true in .env.local to enable)
  const DEBUG =
    typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_LIVESTREAM_DEBUG === "true" ||
      process.env.NEXT_PUBLIC_LIVESTREAM_DEBUG === "1");
  const dbg = React.useCallback(
    (...args: unknown[]) => {
      if (!DEBUG) return;
      console.log("[ViewerCount][debug]", ...args); // intentional debug log
    },
    [DEBUG]
  );

  // Chỉ tính Customer viewers
  const viewerCount = React.useMemo(() => {
    if (!stats) return 0;

    // Nếu server trả trực tiếp customerViewers thì dùng luôn
    if (
      typeof stats.customerViewers === "number" &&
      Number.isFinite(stats.customerViewers)
    ) {
      const val = stats.customerViewers;
      dbg("Using customerViewers direct field", val, stats);
      return val;
    }
    // Fallback: duyệt viewersByRole để tìm role Customer
    const roleMap = stats.viewersByRole || {};
    const customerKey = Object.keys(roleMap).find(
      (k) => k.toLowerCase() === "customer"
    );
    if (customerKey) {
      const val = Number(roleMap[customerKey]);
      if (Number.isFinite(val)) {
        dbg("Derived customer count from viewersByRole", val, roleMap);
        return val;
      }
    }
    return 0; // mặc định
  }, [stats, dbg]);

  // Lắng nghe viewer stats từ SignalR
  React.useEffect(() => {
    if (!livestreamId) return;
    let mounted = true;
    dbg("Mount effect start", { livestreamId });

    (async () => {
      try {
        await chatHubService.ensureStarted();
        dbg("SignalR ensured started");
        // Tham gia nhóm viewers để nhận thống kê chính xác
        try {
          await chatHubService.startViewingLivestream(livestreamId);
          dbg("Invoked startViewingLivestream" , livestreamId);
        } catch (e) {
          dbg("startViewingLivestream failed", e);
        }
        // Optional: cũng join phòng chat nếu server phát cùng nhóm
        try {
          await chatHubService.joinLivestream(livestreamId);
          dbg("Joined chat room", livestreamId);
        } catch (e) {
          dbg("joinLivestream failed", e);
        }

        chatHubService.onViewerStats((payload) => {
          if (!mounted) return;
          if (
            payload.livestreamId?.toLowerCase?.() === livestreamId.toLowerCase()
          ) {
            dbg("Received viewer stats payload", payload);
            setStats(payload);
          }
        });
      } catch {
        // ignore errors
        dbg("Init sequence error (suppressed)");
      }
    })();

    return () => {
      mounted = false;
      dbg("Unmount cleanup", { livestreamId });
      // Rời nhóm viewers để tránh rò rỉ sự kiện
      try {
        chatHubService.stopViewingLivestream(livestreamId);
        dbg("Called stopViewingLivestream");
      } catch (e) {
        dbg("stopViewingLivestream error", e);
      }
      try {
        chatHubService.leaveLivestream(livestreamId);
        dbg("Called leaveLivestream");
      } catch (e) {
        dbg("leaveLivestream error", e);
      }
    };
  }, [livestreamId, dbg]);

  return (
    <div className="flex ml-2">
      <Button className="bg-rose-600 text-white rounded-none hover:bg-rose-600 flex items-center relative overflow-visible">
        <span className="relative mr-2 flex items-center justify-center">
          <span className="absolute h-4 w-4 rounded-full bg-white opacity-75 animate-ping" />
          <span className="h-3 w-3 rounded-full bg-white" />
        </span>
        Live
      </Button>

      <Button className="rounded-none flex items-center gap-1" title="Số khách hàng đang xem">
        <UserRound className="w-4 h-4" />
        {viewerCount}
      </Button>
    </div>
  );
}
