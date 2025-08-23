"use client";

import { Button } from "@/components/ui/button";
import {} from "@livekit/components-react";
import { UserRound } from "lucide-react";
import React from "react";
import { chatHubService, ViewerStatsPayload } from "@/services/signalr/chatHub";

interface ViewerCountProps {
  livestreamId?: string;
}

export function ViewerCount({ livestreamId }: ViewerCountProps) {
  // Viewer stats come from server via SignalR; no need to inspect LiveKit participants here
  const [stats, setStats] = React.useState<ViewerStatsPayload | null>(null);

  // We rely on server stats for viewer count; do not derive from LiveKit participants
  // Requirement: count viewers with roles Customer + Unknown only
  const viewerCount = React.useMemo(() => {
    if (!stats) return 0;
    const roleMap = stats.viewersByRole || {};

    // Helper to read a role value case-insensitively
    const getRoleCount = (roleName: string) => {
      for (const [role, count] of Object.entries(roleMap)) {
        if (String(role).toLowerCase() === roleName.toLowerCase()) {
          return Number(count) || 0;
        }
      }
      return 0;
    };

    // Prefer server-provided CustomerViewers when available and add Unknown from role map
    if (
      typeof stats.customerViewers === "number" &&
      Number.isFinite(stats.customerViewers)
    ) {
      const unknown = getRoleCount("Unknown");
      return stats.customerViewers + unknown;
    }

    // Fallback: sum counts for Customer + Unknown from ViewersByRole
    const customer = getRoleCount("Customer");
    const unknown = getRoleCount("Unknown");
    return customer + unknown;
  }, [stats]);

  React.useEffect(() => {
    if (!livestreamId) return;
    let mounted = true;
    (async () => {
      try {
        await chatHubService.ensureStarted();
        // Join group to receive stats; do NOT startViewing here to avoid double counting
        await chatHubService.joinLivestream(livestreamId);
        chatHubService.onViewerStats((payload) => {
          if (!mounted) return;
          if (
            payload.livestreamId?.toLowerCase?.() === livestreamId.toLowerCase()
          ) {
            setStats(payload);
          }
        });
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
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

      <Button className="rounded-none">
        <UserRound />
        {viewerCount}
      </Button>
    </div>
  );
}
