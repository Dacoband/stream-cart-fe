"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLivestreamActive } from "@/services/api/livestream/livestream";
import { ArrowRight, Play } from "lucide-react";
import { Livestream } from "@/types/livestream/livestream";
import LoadingCard from "./LoadingCard";
function LiveStreaming() {
  const [liveStreamList, setLiveStreamList] = useState<Livestream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const data = await getLivestreamActive();
        setLiveStreamList(data);
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLive();
  }, []);
  return (
    <div className="flex flex-col px-10 py-5 w-full bg-white rounded-xl shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-[#f22020] to-[#d90303] rounded-xl flex items-center justify-center shadow-lg">
            <Play className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              🔴 Xem LiveStream
            </h2>
            <p className="text-gray-600 text-sm">
              Xem trực tiếp các sản phẩm kèm theo deal hời
            </p>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-[#f22020] to-[#d90303] hover:from-[#d90303] hover:to-[#f22020] text-white font-bold px-12 py-3 rounded-md shadow hover:shadow-lg transition-all cursor-pointer duration-300 transform hover:scale-105">
          Xem thêm
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-4 gap-x-5 gap-y-10 pt-2 mb-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <LoadingCard key={index} />
          ))}
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}

export default LiveStreaming;
