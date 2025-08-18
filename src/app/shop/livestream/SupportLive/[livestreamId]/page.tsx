"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  LiveKitRoom,
  useParticipants,
  useTracks,
  VideoTrack,
  AudioTrack,
} from "@livekit/components-react";
import "@livekit/components-styles";
import type { TrackReference } from "@livekit/components-core";
import { Track, DisconnectReason } from "livekit-client";
import {
  getJoinLivestream,
  getLivestreamById,
} from "@/services/api/livestream/livestream";
import type { ProductLiveStream as ProductLS } from "@/types/livestream/productLivestream";
import type { Livestream } from "@/types/livestream/livestream";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import LoadingScreen from "@/components/common/LoadingScreen";
import NotFound from "@/components/common/NotFound";
import Link from "next/link";
import ChatLive from "../../components/ChatLive";
// import ManageProductLive from "../components/ManageProductLive";
import { ViewerCount } from "@/app/shop/livestream/components/ViewCount";
import PinProduct from "../../components/PinProduct";
import { useParams } from "next/navigation";
import PreviewLive from "../components/PreviewLive";
import { Calendar, CirclePlay, Clock } from "lucide-react";
import { formatFullDateTimeVN } from "@/components/common/formatFullDateTimeVN";
import ProductsLiveStream from "../../components/ProductLiveStream";

interface CustomerVideoDisplayProps {
  onParticipantCountChange?: (count: number) => void;
  thumbnailUrl?: string;
}

const CustomerVideoDisplay: React.FC<CustomerVideoDisplayProps> = ({
  onParticipantCountChange,
  thumbnailUrl,
}) => {
  const participants = useParticipants();
  const videoTracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: false },
  ]);
  const audioTracks = useTracks([
    { source: Track.Source.Microphone, withPlaceholder: false },
  ]);

  useEffect(() => {
    if (onParticipantCountChange) {
      onParticipantCountChange(participants?.length || 0);
    }
  }, [participants?.length, onParticipantCountChange]);

  const remoteParticipants = participants?.filter((p) => !p?.isLocal) || [];

  const remoteVideoTracks = (videoTracks || []).filter(
    (t): t is TrackReference => {
      if (!t.publication || t.participant.isLocal) return false;
      const pub = t.publication;
      const track = pub.track as
        | { isMuted?: boolean; mediaStreamTrack?: MediaStreamTrack }
        | undefined;
      const hasLiveTrack =
        !!track && track.mediaStreamTrack?.readyState === "live";
      const notMuted = pub.isMuted === false && track?.isMuted !== true;
      return hasLiveTrack && notMuted;
    }
  );
  const remoteAudioTracks = (audioTracks || []).filter(
    (t): t is TrackReference => !!t.publication && !t.participant.isLocal
  );

  const hasRemoteParticipants = remoteParticipants.length > 0;
  const hasVideo = remoteVideoTracks.length > 0;
  const micOff =
    remoteAudioTracks.length === 0 ||
    remoteAudioTracks.every(
      (t) => t.publication?.isMuted || t.publication?.track?.isMuted
    );

  if (hasRemoteParticipants && hasVideo) {
    const videoTrack = remoteVideoTracks[0];
    return (
      <div className="relative flex flex-col items-center justify-center h-full text-white text-center ">
        <VideoTrack trackRef={videoTrack} />
        <div style={{ display: "none" }}>
          {remoteAudioTracks.map((t) => (
            <AudioTrack
              key={t.publication?.trackSid || t.participant.identity + "-audio"}
              trackRef={t}
            />
          ))}
        </div>

        {micOff && (
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <span role="img" aria-label="mic-off">
              🎤
            </span>
            Tắt mic
          </div>
        )}
      </div>
    );
  }

  if (hasRemoteParticipants && !hasVideo) {
    return (
      <div className="relative lg:flex-row w-full lg:w-2/3 h-[40vh] lg:h-[60vh] bg-black">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt="Thumbnail"
            width={500}
            height={500}
            className="object-cover object-center w-full "
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full bg-gray-800/40 rounded-lg" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-sm md:text-base font-medium">
              Cửa hàng đang tắt camera
            </div>
          </div>
        </div>

        <div className="absolute top-2 right-2 flex gap-2 text-white text-xs">
          <div className="bg-black/60 px-2 py-1 rounded-full flex items-center gap-1">
            <span role="img" aria-label="video-off">
              🎥
            </span>
            Tắt cam
          </div>
          {micOff && (
            <div className="bg-black/60 px-2 py-1 rounded-full flex items-center gap-1">
              <span role="img" aria-label="mic-off">
                🎤
              </span>
              Tắt mic
            </div>
          )}
        </div>

        <div style={{ display: "none" }}>
          {remoteAudioTracks.map((t) => (
            <AudioTrack
              key={t.publication?.trackSid || t.participant.identity + "-audio"}
              trackRef={t}
            />
          ))}
        </div>
      </div>
    );
  }

  if (remoteParticipants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white text-center ">
        <div>
          {participants?.length > 0
            ? "Đang tải live stream..."
            : "Đang kết nối đến livestream..."}
        </div>
        <div color="rgba(255,255,255,0.7)">
          {participants?.length > 0
            ? "Seller đã vào nhưng chưa bật camera. Vui lòng đợi..."
            : "Livestream sẽ bắt đầu ngay khi seller kết nối"}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-white text-center p-4">
      <div className="text-white">🎥 Seller đã vào room!</div>
      <div color="rgba(255,255,255,0.7)">
        Đang chờ seller bật camera... ({remoteParticipants.length} người trong
        room)
      </div>
      <div style={{ display: "none" }}>
        {audioTracks
          .filter(
            (t): t is TrackReference =>
              !!t.publication && !t.participant.isLocal
          )
          .map((t) => (
            <AudioTrack
              key={t.publication?.trackSid || t.participant.identity + "-audio"}
              trackRef={t}
            />
          ))}
      </div>
    </div>
  );
};

export default function ScreenLive() {
  const { livestreamId } = useParams<{ livestreamId: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [livestream, setLivestream] = useState<Livestream | null>(null);
  const [viewerToken, setViewerToken] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [pinned, setPinned] = useState<ProductLS | null>(null);
  const [refreshPin, setRefreshPin] = useState(false);

  const fetchLivestreamData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getLivestreamById(livestreamId);
      setLivestream(response);

      const joinResponse = await getJoinLivestream(livestreamId);
      setViewerToken(joinResponse.joinToken);
    } catch (err) {
      console.error("Error fetching livestream:", err);
      setError("Không thể tải thông tin livestream");
    } finally {
      setLoading(false);
    }
  }, [livestreamId]);

  useEffect(() => {
    fetchLivestreamData();
  }, [fetchLivestreamData]);

  // Poll until livestream starts to auto-switch Preview -> Live without remounting side columns
  useEffect(() => {
    if (!livestream || livestream.status) return; // already live or not loaded
    let timer: NodeJS.Timeout | null = null;
    const tick = async () => {
      try {
        const updated = await getLivestreamById(livestream.id);
        if (updated?.status) {
          setLivestream(updated);
          if (timer) clearInterval(timer);
          timer = null;
        }
      } catch {}
    };
    timer = setInterval(tick, 5000);
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [livestream]);

  if (loading) {
    return (
      <div className="">
        <LoadingScreen />
      </div>
    );
  }

  if (error || !livestream) {
    return (
      <div className="flex-col flex items-center">
        <NotFound />
        <div className="text-xl font-medium mb-8">
          Rất tiếc, Livestream này không tồn tại hoặc bị xóa.
        </div>
        <Link href={"/shop/livestream"}>
          <Button className="cursor-pointer">Quay lại trang chủ</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full h-[92vh]">
      <div className="w-full h-full rounded-none overflow-hidden relative">
        <div className="flex h-full bg-white">
          <div className="flex-1 h-full overflow-y-auto px-10 py-5">
            <div className="flex gap-2 text-2xl mb-4 items-center">
              <CirclePlay className="text-red-600 " /> Theo dõi Livestream
            </div>
            <div className="w-full flex mb-10  ">
              {!livestream.status || !viewerToken ? (
                <PreviewLive livestream={livestream} />
              ) : (
                <LiveKitRoom
                  audio={false}
                  video={false}
                  serverUrl="wss://livekitserver.dacoban.studio"
                  token={viewerToken}
                  connect={true}
                  connectOptions={{
                    autoSubscribe: true,
                    rtcConfig: {
                      iceTransportPolicy: "all",
                      iceServers: [
                        { urls: "stun:stun.l.google.com:19302" },
                        { urls: "stun:stun1.l.google.com:19302" },
                      ],
                      iceCandidatePoolSize: 10,
                    },
                  }}
                  onConnected={() => {
                    setConnectionError(null);
                    setIsConnecting(false);
                    setReconnectAttempts(0);
                  }}
                  onDisconnected={(reason) => {
                    setIsConnecting(false);
                    if (
                      reason === DisconnectReason.SERVER_SHUTDOWN ||
                      reason === DisconnectReason.ROOM_DELETED
                    ) {
                      setConnectionError(
                        "Livestream đã kết thúc hoặc bị gián đoạn. Vui lòng thử tải trang."
                      );
                      return;
                    }
                    if (
                      reason !== DisconnectReason.CLIENT_INITIATED &&
                      reconnectAttempts < 3
                    ) {
                      setReconnectAttempts((prev) => prev + 1);
                      setConnectionError(
                        `Mất kết nối. Đang thử kết nối lại... (${
                          reconnectAttempts + 1
                        }/3)`
                      );
                      if (reconnectTimeoutRef.current) {
                        clearTimeout(reconnectTimeoutRef.current);
                      }
                      reconnectTimeoutRef.current = setTimeout(() => {
                        if (reconnectAttempts >= 2) {
                          setConnectionError(
                            "Không thể kết nối. Livestream có thể đã kết thúc. Vui lòng refresh trang."
                          );
                        }
                      }, 5000);
                    } else if (reconnectAttempts >= 3) {
                      setConnectionError(
                        "Không thể kết nối sau 3 lần thử. Livestream có thể đã kết thúc."
                      );
                    }
                  }}
                  onError={(error) => {
                    setIsConnecting(false);
                    if (
                      error.message &&
                      error.message.includes(
                        "could not establish pc connection"
                      )
                    ) {
                      setConnectionError(
                        "Lỗi kết nối mạng. Vui lòng kiểm tra internet."
                      );
                    } else if (
                      error.message &&
                      error.message.includes(
                        "could not createOffer with closed peer connection"
                      )
                    ) {
                      setConnectionError(
                        "Connection bị đóng. Đang thử kết nối lại..."
                      );
                    } else {
                      setConnectionError(
                        "Lỗi kết nối LiveKit. Vui lòng thử lại."
                      );
                    }
                  }}
                >
                  {isConnecting ? (
                    <div className="flex flex-col items-center justify-center text-white p-4 text-center h-full">
                      <h2 className="text-xl font-bold">
                        🔴 Đang kết nối livestream
                      </h2>
                      <p className="mt-2">Vui lòng đợi trong giây lát...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col lg:flex-row w-full lg:w-2/3 h-[40vh] lg:h-[60vh]">
                      <div className="py-4">
                        <ViewerCount livestreamId={livestream.id} />
                      </div>
                      <div className="flex-1 relative h-full">
                        <CustomerVideoDisplay
                          thumbnailUrl={livestream.thumbnailUrl || undefined}
                        />
                        <div>
                          <PinProduct
                            pinned={pinned}
                            onUnpinned={() => setRefreshPin((f) => !f)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </LiveKitRoom>
              )}

              {connectionError && (
                <div className="absolute bottom-0 left-[10px] right-[10px] z-10 bg-black text-white p-1 rounded text-center">
                  <div>{connectionError}</div>
                </div>
              )}
              {/* Nội dung chi tiết */}
              <div className=" flex-1  p-6 ">
                {/* Tiêu đề */}
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {livestream.title}
                </h3>

                {/* Mô tả */}
                {livestream.description && (
                  <p className="mt-3 text-gray-600 text-sm md:text-base max-w-2xl line-clamp-3">
                    {livestream.description}
                  </p>
                )}

                {/* Thông tin thời gian */}

                <div className="flex items-center ">
                  <Calendar className="w-4 h-4 text-green-500 mr-2" />
                  <span className="font-medium">Lịch hẹn:</span>
                  <span className="ml-1">
                    {livestream.scheduledStartTime
                      ? formatFullDateTimeVN(livestream.scheduledStartTime)
                      : "__ __"}
                  </span>
                </div>
                <div className="flex items-center ">
                  <Clock className="w-4 h-4 text-orange-500 mr-2" />
                  <span className="font-medium">Bắt đầu:</span>
                  <span className="ml-1">
                    {livestream.actualStartTime
                      ? formatFullDateTimeVN(livestream.actualStartTime)
                      : "__ __"}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-red-500 mr-2" />
                  <span className="font-medium">Kết thúc:</span>
                  <span className="ml-1">
                    {livestream.actualEndTime
                      ? formatFullDateTimeVN(livestream.actualEndTime)
                      : "__ __"}
                  </span>
                </div>

                {/* Tags */}
                {livestream.tags && (
                  <span className="mt-6 text-xs bg-gray-100 text-gray-700 px-4 py-1 rounded-full">
                    #{livestream.tags}
                  </span>
                )}
              </div>
            </div>
            <ProductsLiveStream
              livestreamId={livestream.id}
              onPinnedChange={setPinned}
              refreshFlag={refreshPin}
            />
          </div>
          {/* Right: chat (fixed), input disabled until live starts */}
          <div className="w-[20%] h-full">
            <ChatLive
              livestreamId={livestream.id}
              disabledInput={!livestream.status}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
