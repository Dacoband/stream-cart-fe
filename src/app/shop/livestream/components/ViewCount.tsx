"use client";

import { Button } from "@/components/ui/button";
import {
  useParticipants,
  useLocalParticipant,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { UserRound } from "lucide-react";

export function ViewerCount() {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

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

  return (
    <div className="flex ml-2">
      <Button className="bg-rose-600 text-white rounded-none hover:bg-rose-600">
        Live
      </Button>
      <Button className="rounded-none">
        <UserRound />
        {filtered.length}
      </Button>
    </div>
  );
}
