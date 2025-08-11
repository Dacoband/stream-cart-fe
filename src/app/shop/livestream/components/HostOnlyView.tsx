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
    <div className={`bg-black flex w-full h-full ${isFullscreen ? "" : ""}`}>
      {tracks.map((trackRef) => {
        if (!trackRef.publication) return null;
        return (
          <ParticipantTile
            key={trackRef.publication.trackSid}
            trackRef={trackRef}
            className="hide-metadata w-full h-full"
          />
        );
      })}
    </div>
  );
}
