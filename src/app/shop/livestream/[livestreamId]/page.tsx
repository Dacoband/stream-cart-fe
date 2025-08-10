"use client";

import React, { useState, useEffect } from "react";
import {
  LiveKitRoom,
  // VideoConference,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { StopCircle, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getLivestreamById,
  endLivestreamById,
} from "@/services/api/livestream/livestream";
import { Livestream } from "@/types/livestream/livestream";
import { useParams, useRouter } from "next/navigation";
import LoadingScreen from "@/components/common/LoadingScreen";

import { ViewerCount } from "../components/ViewCount";
import { HostOnlyView } from "../components/HostOnlyView";
import { ControlButtons } from "../components/ControlButtons";
import ChatLive from "../components/ChatLive";
import ProductLiveStream from "../components/ProductLiveStream";

export default function SellerLiveStream() {
  const { livestreamId } = useParams<{ livestreamId: string }>();

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [livestream, setLivestream] = useState<Livestream | null>(null);

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
        <Button
          onClick={() => router.push("/shop/livestreams")}
          className="mt-4"
        >
          Quay lại Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-[92vh] flex bg-[#F5F5F5] ">
      <div className=" w-full h-full rounded-none overflow-hidden relative ">
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
            <div className="flex w-full  h-full">
              {!isFullscreen && (
                <div className="w-[20%]">
                  <ProductLiveStream livestreamId={livestream.id} />
                </div>
              )}

              {/* <VideoConference /> */}
              <div
                className={`${
                  isFullscreen ? "flex-1" : "w-[60%]"
                } bg-black relative`}
              >
                <div className="bg-black w-full flex justify-between">
                  <div className=" py-2">
                    <ViewerCount />
                  </div>
                  <div className="flex gap-2 py-2">
                    <Button
                      className="cursor-pointer"
                      variant="secondary"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                    >
                      {isFullscreen ? <ZoomOut /> : <ZoomIn />}
                    </Button>
                    <ControlButtons />
                    <Button
                      variant="destructive"
                      onClick={handleEndLivestream}
                      className="mr-2 cursor-pointer"
                    >
                      <StopCircle className="h-4 w-4" />
                      Kết thúc
                    </Button>
                  </div>
                </div>
                {isConnected ? (
                  <>
                    <HostOnlyView isFullscreen={isFullscreen} />
                    <RoomAudioRenderer />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-white h-[70vh] p-4 text-center">
                    <h2 className="text-xl font-bold">
                      🔴 Đang kết nối livestream
                    </h2>
                    <p className="mt-2">Vui lòng đợi trong giây lát...</p>
                  </div>
                )}
              </div>
              <div className="w-[20%] ">
                <ChatLive livestreamId={livestream.id} />
              </div>
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
    </div>
  );
}
