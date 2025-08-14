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
import { Track } from "livekit-client";
import {
  getJoinLivestream,
  getLivestreamById,
} from "@/services/api/livestream/livestream";
import { DisconnectReason } from "livekit-client";

import { Livestream } from "@/types/livestream/livestream";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import LoadingScreen from "@/components/common/LoadingScreen";
import NotFound from "@/components/common/NotFound";
import Link from "next/link";
import { Calendar, Clock, Info, Play, Store, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatFullDateTimeVN } from "@/components/common/formatFullDateTimeVN";
import ChatLive from "./ChatLive";
import ProductsLive from "./ProductsLive";
import { ViewerCount } from "@/app/shop/livestream/components/ViewCount";
interface ScreenLiveProps {
  liveStreamId: string;
}

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

  console.log("Participants:", participants?.length || 0);
  console.log("Video tracks:", videoTracks?.length || 0);
  console.log("Audio tracks:", audioTracks?.length || 0);
  console.log(
    "Audio tracks details:",
    audioTracks?.map((t) => ({
      participant: t.participant.identity,
      source: t.source,
      enabled: t.publication?.track?.mediaStreamTrack?.enabled,
      muted: t.publication?.track?.isMuted,
    })) || []
  );

  // Cập nhật số participants
  React.useEffect(() => {
    if (onParticipantCountChange) {
      onParticipantCountChange(participants?.length || 0);
    }
  }, [participants?.length, onParticipantCountChange]);

  // Lọc ra seller (remote participants)
  const remoteParticipants = participants?.filter((p) => !p?.isLocal) || [];

  // Determine remote media state
  const remoteVideoTracks = (videoTracks || []).filter(
    (t): t is TrackReference => {
      if (!t.publication || t.participant.isLocal) return false;
      const pub = t.publication;
      const track = pub.track as
        | { isMuted?: boolean; mediaStreamTrack?: MediaStreamTrack }
        | undefined;
      // Treat video as available only when there's an attached track, it's not muted, and the stream is live
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

  // If seller has video on: render live video and show mic-off badge if needed
  if (hasRemoteParticipants && hasVideo) {
    const videoTrack = remoteVideoTracks[0];
    return (
      <div className="relative flex flex-col items-center justify-center h-full text-white text-center ">
        <VideoTrack
          trackRef={videoTrack}
          // style={{
          //   height: "100%",
          //   width: "100%",
          //   objectFit: "contain",
          // }}
        />
        {/* Hidden audio elements for remote participants so viewer hears sound */}
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

  // If seller present but camera is off: show thumbnail fallback and mic/cam badges
  if (hasRemoteParticipants && !hasVideo) {
    return (
      <div className="relative h-full w-full bg-black">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt="Thumbnail"
            width={500}
            height={500}
            className="object-cover object-center w-full h-[70vh] "
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full bg-gray-800/40 rounded-lg" />
          </div>
        )}

        {/* Dark overlay with message */}
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-sm md:text-base font-medium">
              Cửa hàng đang tắt camera
            </div>
          </div>
        </div>

        {/* Badges */}
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

        {/* Keep audio playing if available */}
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

  // Fallback: có participants nhưng chưa có video tracks
  return (
    <div className="flex flex-col items-center justify-center h-full text-white text-center p-4">
      <div className="text-white">🎥 Seller đã vào room!</div>
      <div color="rgba(255,255,255,0.7)">
        Đang chờ seller bật camera... ({remoteParticipants.length} người trong
        room)
      </div>
      {/* Vẫn render audio nếu có (trường hợp chỉ bật micro) */}
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
export default function ScreenLive({ liveStreamId }: ScreenLiveProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [livestream, setLivestream] = useState<Livestream | null>(null);
  const [viewerToken, setViewerToken] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fetchLivestreamData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch livestream details
      const response = await getLivestreamById(liveStreamId);
      setLivestream(response);

      // Join livestream to get viewer token
      const joinResponse = await getJoinLivestream(liveStreamId);
      console.log("Customer join response:", joinResponse.data); // Debug
      setViewerToken(joinResponse.joinToken);
    } catch (err) {
      console.error("Error fetching livestream:", err);
      setError("Không thể tải thông tin livestream");
    } finally {
      setLoading(false);
    }
  }, [liveStreamId]);

  useEffect(() => {
    fetchLivestreamData();
  }, [fetchLivestreamData]);

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
        <Link href={"/home"}>
          <Button className="cursor-pointer">Quay lại trang chủ</Button>
        </Link>
      </div>
    );
  }

  if (!livestream.status) {
    return (
      <div className="flex mt-[15vh] items-center flex-col w-full h-screen">
        {/* Trạng thái livestream */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 bg-lime-200 text-lime-700 px-4 py-2 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            <span>
              {livestream.actualEndTime
                ? "Livestream này đã kết thúc. Vui lòng quay lại sau để xem các livestream khác."
                : "Livestream này chưa bắt đầu. Vui lòng quay lại sau."}
            </span>
          </div>
        </div>

        {/* Thông tin livestream */}
        <Card className="mb-6 border-0 rounded-none shadow-lg w-[55%] mx-auto">
          <CardContent className="px-6 flex flex-col md:flex-row gap-6">
            {/* Thumbnail */}
            <div className="relative w-full md:w-1/3">
              <Image
                src={
                  livestream.thumbnailUrl ||
                  "https://via.placeholder.com/400x400?text=Livestream"
                }
                alt={livestream.title}
                width={400}
                height={400}
                className="w-full aspect-square object-cover rounded-lg"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-lg">
                <div className="text-center text-white">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <Play className="w-8 h-8 ml-1" />
                  </div>
                  <p className="text-sm font-medium">
                    {livestream.actualEndTime
                      ? "Livestream đã kết thúc"
                      : "Livestream chưa bắt đầu"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              {/* Tiêu đề */}
              <h2 className="text-2xl font-bold text-gray-900">
                {livestream.title}
              </h2>

              {/* Mô tả */}
              <p className="flex items-start text-gray-700">
                <Info className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                <span className="font-medium mr-1.5">Mô tả: </span>
                {livestream.description || "Không có mô tả"}
              </p>

              {/* Thời gian bắt đầu */}
              <p className="flex items-center text-gray-600 text-sm">
                <Calendar className="w-4 h-4 text-green-600 mr-2" />{" "}
                <span className="font-medium mr-1.5">Lịch hẹn: </span>
                {livestream.actualStartTime
                  ? formatFullDateTimeVN(livestream.actualStartTime)
                  : "__ __"}
              </p>

              {/* Khoảng thời gian livestream */}
              <p className="flex items-center text-gray-600 text-sm">
                <Clock className="w-4 h-4 text-orange-600 mr-2" />
                <span className="font-medium mr-1.5">Thời gian bắt đầu:</span>
                {livestream.actualStartTime
                  ? formatFullDateTimeVN(livestream.actualStartTime)
                  : "__ __"}
              </p>
              <p className="flex items-center text-gray-600 text-sm">
                <Clock className="w-4 h-4 text-orange-600 mr-2" />
                <span className="font-medium mr-1.5">Thời gian kết thúc:</span>

                {livestream.actualEndTime
                  ? formatFullDateTimeVN(livestream.actualEndTime)
                  : "__ __"}
              </p>
              {/* Tags */}
              <p className="flex items-center text-sm text-gray-500">
                <Tag className="w-4 h-4 text-pink-500 mr-2" />{" "}
                <span className="font-medium mr-1.5">Tags:</span>
                {livestream.tags || ""}
              </p>
              {/* Tên shop */}
              <p className="flex items-center font-semibold text-gray-800">
                <Store className="w-4 h-4 text-purple-600 mr-2" />
                {livestream.shopName}
              </p>

              {/* Nút hành động */}
              <div className="pt-4 flex gap-4 justify-end">
                <Link href="/home">
                  <Button variant="default">Quay lại Trang chủ</Button>
                </Link>
                <Link href={`/store/${livestream.shopId}`}>
                  <Button
                    variant="default"
                    className="bg-[#B0F847] hover:bg-[#B0F847]/80 text-black hover:text-black "
                  >
                    Dạo cửa hàng
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {connectionError && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            right: 10,
            zIndex: 1000,
            backgroundColor: "rgba(255, 152, 0, 0.9)",
            color: "white",
            padding: 1,
            borderRadius: 1,
            textAlign: "center",
          }}
        >
          <div>{connectionError}</div>
        </div>
      )}
      <div className=" w-full h-full rounded-none overflow-hidden relative ">
        {viewerToken ? (
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
              console.log("Customer connected to LiveKit");
              setConnectionError(null);
              setIsConnecting(false);
              setReconnectAttempts(0); // Reset on successful connection
            }}
            onDisconnected={(reason) => {
              console.log("Customer disconnected from LiveKit:", reason);
              setIsConnecting(false);

              // Reason code meanings:
              // 0 = manual disconnect
              // 1 = duplicate identity
              // 2 = server initiated (room closed, etc)
              // 3 = participant removed
              // 4 = room deleted
              // 5 = state mismatch

              if (reason === 2 || reason === 4) {
                setConnectionError(
                  "Livestream đã kết thúc hoặc bị gián đoạn. Vui lòng thử tải trang."
                );
                return;
              }

              // Chỉ retry nếu không phải manual disconnect và chưa quá 3 lần
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

                // Clear any existing timeout
                if (reconnectTimeoutRef.current) {
                  clearTimeout(reconnectTimeoutRef.current);
                }

                // Retry sau 5 giây thay vì reload ngay
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
              console.error("Customer LiveKit error:", error);
              setIsConnecting(false);

              if (
                error.message &&
                error.message.includes("could not establish pc connection")
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
                setConnectionError("Lỗi kết nối LiveKit. Vui lòng thử lại.");
              }
            }}
          >
            <div className="flex h-full">
              <div className="w-[20%] h-full ">
                <ProductsLive livestreamId={livestream.id} />
              </div>
              <div className="w-[60%] bg-black h-full relative mb-28">
                {isConnecting ? (
                  <div className="flex flex-col items-center justify-center text-white h-[70vh] p-4 text-center">
                    <h2 className="text-xl font-bold">
                      🔴 Đang kết nối livestream
                    </h2>
                    <p className="mt-2">Vui lòng đợi trong giây lát...</p>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <div className=" py-4">
                      <ViewerCount livestreamId={livestream.id} />
                    </div>
                    <div className="flex-1 relative h-full ">
                      <CustomerVideoDisplay
                        thumbnailUrl={livestream.thumbnailUrl || undefined}
                      />
                      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
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
                  </div>
                )}
              </div>
              <div className="w-[20%] h-full ">
                <ChatLive livestreamId={livestream.id} />
              </div>
            </div>
          </LiveKitRoom>
        ) : (
          <div>
            <div>📺 Đang tải livestream...</div>
          </div>
        )}
      </div>
    </div>
  );
}
