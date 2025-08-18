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
import type { ProductLiveStream as ProductLS } from "@/types/livestream/productLivestream";
import { useParams, useRouter } from "next/navigation";
import LoadingScreen from "@/components/common/LoadingScreen";

import { ViewerCount } from "../components/ViewCount";
import { HostOnlyView } from "../components/HostOnlyView";
import { ControlButtons } from "../components/ControlButtons";
import ChatLive from "../components/ChatLive";
import ProductLiveStream from "../components/ProductLiveStream";
import PinProduct from "../components/PinProduct";

export default function SellerLiveStream() {
  const { livestreamId } = useParams<{ livestreamId: string }>();

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [livestream, setLivestream] = useState<Livestream | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [devicesChecked, setDevicesChecked] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [hasMic, setHasMic] = useState(true);
  const [pinned, setPinned] = useState<ProductLS | null>(null);
  const [refreshPin, setRefreshPin] = useState(false);

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

  // Detect available media devices before connecting to LiveKit to avoid NotFoundError
  useEffect(() => {
    let mounted = true;
    async function detectDevices() {
      try {
        if (
          typeof window === "undefined" ||
          !navigator?.mediaDevices?.enumerateDevices
        ) {
          if (mounted) {
            setHasCamera(true);
            setHasMic(true);
            setDevicesChecked(true);
          }
          return;
        }
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cams = devices.filter((d) => d.kind === "videoinput");
        const mics = devices.filter((d) => d.kind === "audioinput");
        if (mounted) {
          setHasCamera(cams.length > 0);
          setHasMic(mics.length > 0);
          setDevicesChecked(true);
        }
      } catch {
        if (mounted) {
          // Fall back to enabling both; LiveKit will surface errors which we handle in onError
          setHasCamera(true);
          setHasMic(true);
          setDevicesChecked(true);
        }
      }
    }
    detectDevices();
    const handleChange = () => detectDevices();
    if (
      typeof navigator !== "undefined" &&
      navigator.mediaDevices?.addEventListener
    ) {
      navigator.mediaDevices.addEventListener("devicechange", handleChange);
    }
    return () => {
      mounted = false;
      if (
        typeof navigator !== "undefined" &&
        navigator.mediaDevices?.removeEventListener
      ) {
        navigator.mediaDevices.removeEventListener(
          "devicechange",
          handleChange
        );
      }
    };
  }, []);

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
          // Wait until we check devices to decide initial audio/video flags
          devicesChecked && (
            <LiveKitRoom
              serverUrl="wss://livekitserver.dacoban.studio"
              token={livestream.joinToken}
              connect
              connectOptions={{
                autoSubscribe: false,
              }}
              onConnected={() => setIsConnected(true)}
              onDisconnected={() => setIsConnected(false)}
              onError={(error) => {
                console.error("LiveKit error:", error);
                // Gracefully handle missing devices
                const msg = String(error?.message || "");
                if (
                  msg.includes("Requested device not found") ||
                  msg.includes("NotFoundError")
                ) {
                  // Turn off the missing device to avoid repeated errors
                  setHasCamera((prev) => prev && false);
                  setHasMic((prev) => prev && false);
                }
              }}
              audio={hasMic}
              video={hasCamera}
            >
              <div className="flex w-full bg-black  h-full">
                {!isFullscreen && (
                  <div className="w-[20%]">
                    <ProductLiveStream
                      livestreamId={livestream.id}
                      onPinnedChange={setPinned}
                      refreshFlag={refreshPin}
                    />
                  </div>
                )}

                {/* <VideoConference /> */}
                <div
                  className={`${
                    isFullscreen ? "flex-1" : "w-[60%]"
                  } bg-black relative mb-28`}
                >
                  <div className="bg-black w-full flex justify-between">
                    <div className=" py-4">
                      <ViewerCount livestreamId={livestream.id} />
                    </div>
                    <div className="flex gap-2 py-4">
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
                    <div className="flex-1 relative h-full ">
                      <HostOnlyView isFullscreen={isFullscreen} />
                      <RoomAudioRenderer />
                      <div className="top-10 left-4  absolute z-10">
                        <PinProduct
                          pinned={pinned}
                          onUnpinned={() => setRefreshPin((f) => !f)}
                        />
                      </div>

                      <div className="absolute bottom-0 left-0 px-4 w-full bg-gradient-to-t from-black/70 to-transparent py-4 text-white">
                        <h3 className="text-2xl font-bold mb-3">
                          {livestream.title}
                        </h3>
                        <p className="text-base mb-5 opacity-80">
                          {livestream.description}
                        </p>
                        <p className="text-sm bg-white text-black opacity-80 px-5 py-1 rounded-full w-fit">
                          #{livestream.tags}
                        </p>
                      </div>
                    </div>
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
          )
        ) : (
          <div className="flex flex-col items-center justify-center text-white h-[70vh] p-4 text-center">
            <h2 className="text-xl font-bold">
              🔴 Livestream chưa được khởi động
            </h2>
            <p className="mt-2">
              Bạn cần bắt đầu livestream để có thể phát sóng
            </p>

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
