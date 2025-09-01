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
import { chatHubService, LivestreamMessagePayload } from "@/services/signalr/chatHub";
import { toast } from "sonner";

import { ViewerCount } from "../components/ViewCount";
import { HostOnlyView } from "../components/HostOnlyView";
import { ControlButtons } from "../components/ControlButtons";
import ChatLive from "../components/ChatLive";
import ProductLiveStream from "../components/ProductLiveStream";
import PinProductHost from "../components/PinProductHost";

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

  // State for livestream time notifications
  const [timeNotification, setTimeNotification] = useState<{
    message: string;
    type: 'warning' | 'error';
    visible: boolean;
  } | null>(null);

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

  // Setup SignalR for livestream time notifications
  useEffect(() => {
    let mounted = true;
    
    const setupNotifications = async () => {
      try {
        await chatHubService.ensureStarted();
        console.log('[DEBUG] SellerLiveStream: SignalR connected for time notifications');
        
        await chatHubService.joinLivestream(livestreamId);
        console.log('[DEBUG] SellerLiveStream: Joined livestream group');

        // Listen for broadcast messages
        chatHubService.onReceiveLivestreamMessage((payload: LivestreamMessagePayload) => {
          if (!mounted) return;
          
          console.log('[DEBUG] 🔍 SellerLiveStream received message:', {
            senderType: payload.senderType,
            senderName: payload.senderName,
            message: payload.message?.substring(0, 100) + '...'
          });
          
          if (payload.senderType === 'System' || payload.senderName === '🤖 Hệ thống') {
            if (payload.message.includes('⚠️') && payload.message.includes('Livestream sẽ kết thúc')) {
              console.log('[DEBUG] 🚨 SellerLiveStream: Time warning detected');
              
              // Show in-stream notification
              setTimeNotification({
                message: payload.message.replace('⚠️ ', ''),
                type: 'warning',
                visible: true
              });
              
              // Also show toast
              toast.warning("⏰ Cảnh báo thời gian livestream", {
                description: payload.message.replace('⚠️ ', ''),
                duration: 60000, // 1 phút = 60 giây
                action: {
                  label: "Đã hiểu",
                  onClick: () => {
                    console.log("Seller acknowledged warning");
                    setTimeNotification(prev => prev ? { ...prev, visible: false } : null);
                  },
                },
              });
              
              // Auto hide after 60 seconds
              setTimeout(() => {
                setTimeNotification(prev => prev ? { ...prev, visible: false } : null);
              }, 60000);
              
            } else if (payload.message.includes('⛔') && payload.message.includes('Livestream đã hết thời gian')) {
              console.log('[DEBUG] 🛑 SellerLiveStream: Time expired detected');
              
              // Show in-stream notification
              setTimeNotification({
                message: payload.message.replace('⛔ ', ''),
                type: 'error',
                visible: true
              });
              
              // Also show toast
              toast.error("⏹️ Livestream kết thúc", {
                description: payload.message.replace('⛔ ', ''),
                duration: 60000, // 1 phút = 60 giây
                action: {
                  label: "Đã hiểu",
                  onClick: () => {
                    console.log("Seller acknowledged expiry");
                    setTimeNotification(prev => prev ? { ...prev, visible: false } : null);
                  },
                },
              });
              
              // Auto hide after 60 seconds
              setTimeout(() => {
                setTimeNotification(prev => prev ? { ...prev, visible: false } : null);
              }, 60000);
            }
          }
        });

        // Listen for private messages (seller specific)
        chatHubService.onNewLivestreamMessage((payload: LivestreamMessagePayload) => {
          if (!mounted) return;
          
          console.log('[DEBUG] 🔍 SellerLiveStream onNewLivestreamMessage:', {
            senderType: payload.senderType,
            senderName: payload.senderName,
            message: payload.message?.substring(0, 100) + '...'
          });
          
          if (payload.senderType === 'System' || payload.senderName === '🤖 Hệ thống') {
            if (payload.message.includes('⚠️') && payload.message.includes('Livestream sẽ kết thúc')) {
              console.log('[DEBUG] 🚨 SellerLiveStream: Private time warning detected');
              
              // Show in-stream notification
              setTimeNotification({
                message: payload.message.replace('⚠️ ', ''),
                type: 'warning',
                visible: true
              });
              
              // Also show toast
              toast.warning("⏰ Cảnh báo thời gian livestream", {
                description: payload.message.replace('⚠️ ', ''),
                duration: 60000, // 1 phút = 60 giây
                action: {
                  label: "Đã hiểu",
                  onClick: () => {
                    console.log("Seller acknowledged private warning");
                    setTimeNotification(prev => prev ? { ...prev, visible: false } : null);
                  },
                },
              });
              
              // Auto hide after 60 seconds
              setTimeout(() => {
                setTimeNotification(prev => prev ? { ...prev, visible: false } : null);
              }, 60000);
              
            } else if (payload.message.includes('⛔') && payload.message.includes('Livestream đã hết thời gian')) {
              console.log('[DEBUG] 🛑 SellerLiveStream: Private time expired detected');
              
              // Show in-stream notification
              setTimeNotification({
                message: payload.message.replace('⛔ ', ''),
                type: 'error',
                visible: true
              });
              
              // Also show toast
              toast.error("⏹️ Livestream kết thúc", {
                description: payload.message.replace('⛔ ', ''),
                duration: 60000, // 1 phút = 60 giây
                action: {
                  label: "Đã hiểu",
                  onClick: () => {
                    console.log("Seller acknowledged private expiry");
                    setTimeNotification(prev => prev ? { ...prev, visible: false } : null);
                  },
                },
              });
              
              // Auto hide after 60 seconds
              setTimeout(() => {
                setTimeNotification(prev => prev ? { ...prev, visible: false } : null);
              }, 60000);
            }
          }
        });

      } catch (error) {
        console.error('[DEBUG] SellerLiveStream: SignalR setup error:', error);
      }
    };

    setupNotifications();

    return () => {
      mounted = false;
      chatHubService.leaveLivestream(livestreamId);
    };
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
        router.push(`/shop/livestream/${livestreamId}/review-livestream`);
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
                    <ProductLiveStream livestreamId={livestream.id} />
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
                      
                      {/* Time Notification Overlay */}
                      {timeNotification && timeNotification.visible && (
                        <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-20 max-w-md mx-auto p-4 rounded-lg shadow-lg ${
                          timeNotification.type === 'warning' 
                            ? 'bg-orange-500 text-white border-orange-600' 
                            : 'bg-red-500 text-white border-red-600'
                        } border-2 animate-pulse`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">
                                {timeNotification.type === 'warning' ? '⚠️' : '⛔'}
                              </span>
                              <div>
                                <p className="font-bold text-sm">
                                  {timeNotification.type === 'warning' ? 'Cảnh báo thời gian!' : 'Livestream kết thúc!'}
                                </p>
                                <p className="text-xs opacity-90">
                                  {timeNotification.message}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setTimeNotification(prev => prev ? { ...prev, visible: false } : null)}
                              className="ml-2 text-xs px-2 py-1 h-auto"
                            >
                              Đã hiểu
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      <div className="top-10 left-4  absolute z-10">
                        <PinProductHost livestreamId={livestream.id} />
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
