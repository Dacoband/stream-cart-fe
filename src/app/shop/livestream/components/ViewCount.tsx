"use client";

import { Button } from "@/components/ui/button";
import {
  useParticipants,
  useLocalParticipant,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { UserRound } from "lucide-react";
import React from "react";
import { chatHubService, ViewerStatsPayload } from "@/services/signalr/chatHub";

interface ViewerCountProps {
  livestreamId?: string;
}

export function ViewerCount({ livestreamId }: ViewerCountProps) {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const [stats, setStats] = React.useState<ViewerStatsPayload | null>(null);

  const filtered = participants.filter((p) => {
    // Loại chính mình
    if (p.identity === localParticipant.identity) return false;

    // Kiểm tra xem participant có đang share màn hình không
    const screenTrackPub = p.getTrackPublication(Track.Source.ScreenShare);
    const screenAudioPub = p.getTrackPublication(Track.Source.ScreenShareAudio);

    const isSharingScreen =
      (screenTrackPub?.track && !screenTrackPub.track.isMuted) ||
      (screenAudioPub?.track && !screenAudioPub.track.isMuted);

    // Chỉ giữ những người KHÔNG share màn hình
    return !isSharingScreen;
  });

  const viewerOnlyFromStats = React.useMemo(() => {
    if (!stats) return null;
    const roleMap = stats.viewersByRole || {};
    // Exclude shop-like roles
    const excludeKeys = ["Shop", "Seller", "Host", "Owner"];
    const viewers = Object.entries(roleMap)
      .filter(([role]) => !excludeKeys.includes(role))
      .reduce((sum, [, count]) => sum + (count || 0), 0);
    return viewers;
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
        {viewerOnlyFromStats ?? filtered.length}
      </Button>
    </div>
  );
}
