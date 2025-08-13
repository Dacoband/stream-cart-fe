// app/view-liveStream/[liveStreamId]/page.tsx
"use client";
import React from "react";
import ScreenLive from "../components/ScreenLive";
import { useParams } from "next/navigation";

export default function LivePage() {
  const { liveStreamId } = useParams<{ liveStreamId: string }>();

  return (
    <div className="h-full min-h-screen w-full">
      <ScreenLive liveStreamId={liveStreamId} />
    </div>
  );
}
