import { useLocalParticipant } from "@livekit/components-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

export function ControlButtons() {
  const { localParticipant } = useLocalParticipant();
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  const toggleCamera = async () => {
    try {
      await localParticipant.setCameraEnabled(!isCameraOn);
      setIsCameraOn((prev) => !prev);
    } catch (err) {
      console.error("Lỗi khi toggle camera:", err);
    }
  };

  const toggleMic = async () => {
    try {
      await localParticipant.setMicrophoneEnabled(!isMicOn);
      setIsMicOn((prev) => !prev);
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
