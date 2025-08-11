import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  LiveKitRoom,
  useParticipants,
  useTracks,
  VideoTrack,
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
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
interface ScreenLiveProps {
  liveStreamId: string;
}

interface CustomerVideoDisplayProps {
  onParticipantCountChange?: (count: number) => void;
}

const CustomerVideoDisplay: React.FC<CustomerVideoDisplayProps> = ({
  onParticipantCountChange,
}) => {
  const participants = useParticipants();
  const videoTracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: false },
  ]);

  console.log("Participants:", participants?.length || 0);
  console.log("Video tracks:", videoTracks?.length || 0);
  console.log(
    "Video tracks details:",
    videoTracks?.map((t) => ({
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

  // Nếu có remote participants và video tracks
  if (remoteParticipants.length > 0 && videoTracks?.length > 0) {
    const videoTrack = videoTracks.find(
      (t): t is TrackReference => t.publication !== undefined
    );

    if (videoTrack) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-white text-center p-4">
          <VideoTrack
            trackRef={videoTrack}
            style={{
              height: "100%",
              width: "100%",
              objectFit: "contain",
            }}
          />
        </div>
      );
    }
  }

  if (remoteParticipants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white text-center p-4">
        <div>
          {participants?.length > 0
            ? "Đang chờ seller bắt đầu stream..."
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
      <div>🎥 Seller đã vào room!</div>
      <div color="rgba(255,255,255,0.7)">
        Đang chờ seller bật camera... ({remoteParticipants.length} người trong
        room)
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
  const [participantCount, setParticipantCount] = useState(0);
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
      <div className="h-[80vh]">
        <Loader2 />
      </div>
    );
  }

  if (error || !livestream) {
    return (
      <div>
        <div>{error || "Không thể tải Livestream"}</div>
        <Button>Quay lại danh sách</Button>
      </div>
    );
  }

  if (!livestream.status) {
    return (
      <div>
        <div>
          <div>Livestream chưa bắt đầu hoặc đã kết thúc</div>
          <div>
            {livestream.actualEndTime
              ? "Livestream này đã kết thúc. Vui lòng quay lại sau để xem các livestream khác."
              : "Livestream này chưa bắt đầu. Vui lòng quay lại sau."}
          </div>
          <div>{livestream.title}</div>
          <Image
            src={
              livestream.thumbnailUrl ||
              "https://via.placeholder.com/400x200?text=Livestream"
            }
            alt={livestream.title}
            width={400} // hoặc tuỳ chỉnh theo layout thực tế
            height={200}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: 300,
              marginTop: "0.5rem",
              marginBottom: "0.5rem",
              borderRadius: "0.25rem",
              objectFit: "cover",
            }}
          />
          <div>{livestream.description}</div>
          <Button>Quay lại danh sách livestream</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <div>
          {/* Livestream Video Panel */}
          <div>
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
            <div
              style={{
                backgroundColor: "black",
                height: "70vh",
                position: "relative",
              }}
            >
              {viewerToken ? (
                <LiveKitRoom
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
                        "Livestream đã kết thúc hoặc bị gián đoạn. Vui lòng refresh trang."
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
                  audio={true}
                  video={false}
                >
                  {isConnecting ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        color: "white",
                        textAlign: "center",
                      }}
                    >
                      <div>Đang kết nối đến livestream...</div>
                    </div>
                  ) : (
                    <CustomerVideoDisplay
                      onParticipantCountChange={setParticipantCount}
                    />
                  )}
                </LiveKitRoom>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: "white",
                    textAlign: "center",
                  }}
                >
                  <div>📺 Đang tải livestream...</div>
                </div>
              )}
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>{livestream.title}</div>

                <div>
                  <div>{participantCount} người xem</div>
                </div>
              </div>

              <div>{livestream.description}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
