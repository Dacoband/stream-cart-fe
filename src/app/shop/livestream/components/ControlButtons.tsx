import { useLocalParticipant } from "@livekit/components-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

export function ControlButtons() {
  const { localParticipant } = useLocalParticipant();
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  useEffect(() => {
    const camStored = localStorage.getItem("live_cam_on");
    const micStored = localStorage.getItem("live_mic_on");
    const cam = camStored ? camStored === "true" : false;
    const mic = micStored ? micStored === "true" : false;
    setIsCameraOn(cam);
    setIsMicOn(mic);
    (async () => {
      try {
        await localParticipant.setCameraEnabled(cam);
      } catch {}
      try {
        await localParticipant.setMicrophoneEnabled(mic);
      } catch {}
    })();
  }, [localParticipant]);

  const toggleCamera = async () => {
    try {
      const next = !isCameraOn;
      await localParticipant.setCameraEnabled(next);
      setIsCameraOn(next);
      localStorage.setItem("live_cam_on", String(next));
    } catch (err) {
      console.error("Lỗi khi toggle camera:", err);
    }
  };

  const toggleMic = async () => {
    try {
      const next = !isMicOn;
      await localParticipant.setMicrophoneEnabled(next);
      setIsMicOn(next);
      localStorage.setItem("live_mic_on", String(next));
    } catch (err) {
      console.error("Lỗi khi toggle microphone:", err);
    }
  };

  return (
    <div className="flex gap-2">
      {/* Camera */}
      <Button
        className={`cursor-pointer ${
          !isCameraOn ? "bg-gray-600 text-white" : ""
        }`}
        variant={isCameraOn ? "secondary" : "outline"}
        onClick={toggleCamera}
      >
        {isCameraOn ? <Video /> : <VideoOff />}
      </Button>

      {/* Microphone */}
      <Button
        className={`cursor-pointer ${!isMicOn ? "bg-gray-600 text-white" : ""}`}
        variant={isMicOn ? "secondary" : "outline"}
        onClick={toggleMic}
      >
        {isMicOn ? <Mic /> : <MicOff />}
      </Button>
    </div>
  );
}
