// import { useLocalParticipant } from "@livekit/components-react";
// import { Track } from "livekit-client";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Mic, MicOff, Video, VideoOff } from "lucide-react";

// // export function ControlButtons() {
// //   const { localParticipant } = useLocalParticipant();
// //   const [isCameraOn, setIsCameraOn] = useState(true);

// //   const handleToggleCamera = () => {
// //     const cameraPub = localParticipant.getTrackPublication(Track.Source.Camera);
// //     if (cameraPub) {
// //       if (isCameraOn) {
// //         cameraPub.track?.mute();
// //       } else {
// //         cameraPub.track?.unmute();
// //       }
// //       setIsCameraOn(!isCameraOn);
// //     }
// //   };

// //   return (
// //     <Button
// //       variant={isCameraOn ? "secondary" : "destructive"}
// //       onClick={handleToggleCamera}
// //     >
// //       {isCameraOn ? "Tắt camera" : "Bật camera"}
// //     </Button>
// //   );
// // }
// export function ControlButtons() {
//   const { localParticipant } = useLocalParticipant();
//   const [isCameraOn, setIsCameraOn] = useState(true);
//   const [isMicOn, setIsMicOn] = useState(true);

//   const toggleTrack = (
//     source: Track.Source,
//     isOn: boolean,
//     setState: (val: boolean) => void
//   ) => {
//     const pub = localParticipant.getTrackPublication(source);
//     if (pub) {
//       if (isOn) {
//         pub.track?.mute();
//       } else {
//         pub.track?.unmute();
//       }
//       setState(!isOn);
//     }
//   };

//   return (
//     <div className="flex gap-2">
//       {/* Camera */}
//       <Button
//         className={`cursor-pointer ${
//           !isCameraOn ? "bg-gray-600  text-white" : ""
//         }`}
//         variant={isCameraOn ? "secondary" : "outline"}
//         onClick={() =>
//           toggleTrack(Track.Source.Camera, isCameraOn, setIsCameraOn)
//         }
//       >
//         {isCameraOn ? <Video /> : <VideoOff className="line-through" />}
//       </Button>

//       {/* Microphone */}
//       <Button
//         className={`cursor-pointer ${!isMicOn ? "bg-gray-600 text-white" : ""}`}
//         variant={isMicOn ? "secondary" : "outline"}
//         onClick={() =>
//           toggleTrack(Track.Source.Microphone, isMicOn, setIsMicOn)
//         }
//       >
//         {isMicOn ? <Mic /> : <MicOff />}
//       </Button>
//     </div>
//   );
// }
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
