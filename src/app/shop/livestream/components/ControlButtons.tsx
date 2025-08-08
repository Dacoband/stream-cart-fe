// components/livestream/ControlButtons.tsx
import { useLocalParticipant } from "@livekit/components-react";
import { Track } from "livekit-client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ControlButtons() {
  const { localParticipant } = useLocalParticipant();
  const [isCameraOn, setIsCameraOn] = useState(true);

  const handleToggleCamera = () => {
    const cameraPub = localParticipant.getTrackPublication(Track.Source.Camera);
    if (cameraPub) {
      if (isCameraOn) {
        cameraPub.track?.mute();
      } else {
        cameraPub.track?.unmute();
      }
      setIsCameraOn(!isCameraOn);
    }
  };

  return (
    <Button
      variant={isCameraOn ? "secondary" : "destructive"}
      onClick={handleToggleCamera}
    >
      {isCameraOn ? "Tắt camera" : "Bật camera"}
    </Button>
  );
}
