"use client";
import React from "react";
import Image from "next/image";
import { Clock } from "lucide-react";

import type { Livestream } from "@/types/livestream/livestream";

type PreviewLiveProps = {
  livestream: Livestream;
};

export default function PreviewLive({ livestream }: PreviewLiveProps) {
  return (
    <div className="lg:flex-row w-full lg:w-2/3 h-[40vh] lg:h-[60vh] rounded-none overflow-hidden bg-white">
      <div className="relative w-full h-full bg-black">
        {/* Ảnh phủ toàn bộ */}
        <Image
          src={
            livestream.thumbnailUrl ||
            "https://via.placeholder.com/1280x720?text=Livestream"
          }
          alt={livestream.title}
          fill
          className="object-cover opacity-50"
        />

        {/* Trạng thái livestream - chữ nằm giữa ảnh */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
               inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-md
               bg-lime-200 text-black"
        >
          <Clock className="w-4 h-4" />
          <span>
            {livestream.actualEndTime
              ? "Livestream đã kết thúc"
              : "Livestream chưa bắt đầu"}
          </span>
        </div>
      </div>
    </div>
  );
}
