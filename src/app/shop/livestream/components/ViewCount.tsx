// components/livestream/ViewerCount.tsx
import { useParticipants } from "@livekit/components-react";

export function ViewerCount() {
  const participants = useParticipants();
  const viewerCount = participants.length;

  return (
    <span className="text-4xl text-blue-500">{viewerCount} người đang xem</span>
  );
}
