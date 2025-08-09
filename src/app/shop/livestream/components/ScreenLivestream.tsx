"use client";

import React, { useState, useEffect } from "react";
import {
  LiveKitRoom,
  // VideoConference,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Users, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getLivestreamById,
  endLivestreamById,
} from "@/services/api/livestream/livestream";
import { useParticipants } from "@livekit/components-react";
import { Livestream } from "@/types/livestream/livestream";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/common/LoadingScreen";

import { useTracks, ParticipantTile } from "@livekit/components-react";
import { Track } from "livekit-client";
import { useLocalParticipant } from "@livekit/components-react";
function HostOnlyView({ isFullscreen }: { isFullscreen: boolean }) {
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
          />
        );
      })}
    </div>
  );
}

interface ScreenLiveProps {
  livestreamId: string;
}
const ViewerCount = () => {
  const participants = useParticipants();
  const viewerCount = participants.length;

  return (
    <span className="text-4xl text-blue-500">{viewerCount} người đang xem</span>
  );
};
function ControlButtons() {
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

export default function ScreenLivestream({ livestreamId }: ScreenLiveProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [livestream, setLivestream] = useState<Livestream | null>(null);
  const [participants, setParticipants] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const fetchLivestreamData = async () => {
      try {
        setLoading(true);
        const response = await getLivestreamById(livestreamId);
        setLivestream(response);
      } catch {
        setError("Không thể tải thông tin livestream");
      } finally {
        setLoading(false);
      }
    };

    fetchLivestreamData();
  }, [livestreamId]);

  const handleEndLivestream = async () => {
    if (window.confirm("Bạn có chắc chắn muốn kết thúc buổi phát sóng?")) {
      try {
        await endLivestreamById(livestreamId);
        router.push("/shop/livestreams");
      } catch (err) {
        console.error("Error ending livestream:", err);
      }
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !livestream) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-500 font-semibold">
          {error || "Không thể tải Livestream"}
        </p>
        <Button onClick={() => router.push("/dashboard")} className="mt-4">
          Quay lại Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full ">
      <div className=" flex flex-col gap-6">
        <div className="md:col-span-2 bg-black rounded-lg overflow-hidden relative">
          {livestream.joinToken ? (
            <LiveKitRoom
              serverUrl="wss://livekitserver.dacoban.studio"
              token={livestream.joinToken}
              connect
              connectOptions={{
                autoSubscribe: false,
              }}
              onConnected={() => setIsConnected(true)}
              onDisconnected={() => setIsConnected(false)}
              onError={(error) => console.error("LiveKit error:", error)}
              audio
              video
            >
              <ViewerCount />
              {/* <VideoConference /> */}
              <HostOnlyView isFullscreen={isFullscreen} />
              <RoomAudioRenderer />
              {/* Nút điều khiển */}
              <div className="fixed bottom-4 right-4 flex gap-2 z-[999]">
                <Button
                  variant="secondary"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? "Thu nhỏ" : "Phóng to"}
                </Button>
                <ControlButtons />
                <Button variant="destructive" onClick={handleEndLivestream}>
                  <StopCircle className="mr-2 h-4 w-4" />
                  Kết thúc
                </Button>
              </div>
            </LiveKitRoom>
          ) : (
            <div className="flex flex-col items-center justify-center text-white h-[70vh] p-4 text-center">
              <h2 className="text-xl font-bold">
                🔴 Livestream chưa được khởi động
              </h2>
              <p className="mt-2">
                Bạn cần bắt đầu livestream để có thể phát sóng
              </p>
              {/* Thêm nút Bắt đầu livestream nếu cần */}
              <Button
                variant="destructive"
                onClick={handleEndLivestream}
                className="mt-4"
              >
                <StopCircle className="mr-2 h-4 w-4" />
                Kết thúc livestream
              </Button>
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold">{livestream.title}</h1>
          <div className="flex items-center text-gray-600 mt-2">
            <Users className="w-4 h-4 mr-1" />
            <span>{participants} người xem</span>
          </div>
          <p className="mt-2">{livestream.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {livestream.tags?.split(",").map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-sm rounded-full border"
              >
                #{tag.trim()}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
