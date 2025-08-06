"use client";

import React, { useState, useEffect } from "react";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useParams } from "next/navigation";
import { Loader2, Users, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getLivestreamById,
  endLivestreamById,
} from "@/services/api/livestream/livestream";
import { Livestream } from "@/types/livestream/livestream";
import { useRouter } from "next/navigation";

const LivestreamRoom = () => {
  const router = useRouter();
  const { livestreamId } = useParams<{ livestreamId: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [livestream, setLivestream] = useState<Livestream | null>(null);
  const [participants, setParticipants] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

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
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
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
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <VideoConference chatMessageFormatter={() => ""} />
              <RoomAudioRenderer />
              <div className="absolute bottom-4 right-4">
                <Button variant="destructive" onClick={handleEndLivestream}>
                  <StopCircle className="mr-2 h-4 w-4" />
                  Kết thúc livestream
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
};

export default LivestreamRoom;
