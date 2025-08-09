import { useTracks, ParticipantTile } from "@livekit/components-react";
import { Track } from "livekit-client";

interface HostOnlyViewProps {
  isFullscreen: boolean;
}

export function HostOnlyView({ isFullscreen }: HostOnlyViewProps) {
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: false },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  return (
    <div
      className={`bg-black flex items-center justify-center ${
        isFullscreen ? "fixed inset-0 z-50" : "w-full h-full"
      }`}
    >
      {tracks.map((trackRef) => {
        if (!trackRef.publication) return null;
        return (
          <ParticipantTile
            key={trackRef.publication.trackSid}
            trackRef={trackRef}
            className="hide-metadata"
          />
        );
      })}
    </div>
  );
}
