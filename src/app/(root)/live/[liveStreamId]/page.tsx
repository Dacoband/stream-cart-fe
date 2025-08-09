// app/view-liveStream/[liveStreamId]/page.tsx
"use client";
import React from "react";
import ScreenLive from "../components/ScreenLive";

interface PageProps {
  params: {
    liveStreamId: string;
  };
}

export default function Page({ params }: PageProps) {
  const { liveStreamId } = params;

  return (
    <div>
      <ScreenLive liveStreamId={liveStreamId} />
    </div>
  );
}
