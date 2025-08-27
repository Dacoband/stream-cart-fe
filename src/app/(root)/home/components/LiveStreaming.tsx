"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLivestreamActive } from "@/services/api/livestream/livestream";
import { ArrowRight, Play } from "lucide-react";
import { Livestream } from "@/types/livestream/livestream";
import LoadingCard from "./LoadingCard";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function LiveStreaming() {
  const { user } = useAuth();
  const router = useRouter();
  const [liveStreamList, setLiveStreamList] = useState<Livestream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const data = await getLivestreamActive();
        setLiveStreamList(data);
      } catch (err) {
        console.error("Lỗi khi tải livestream:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLive();
  }, []);

  const handleGoLive = (liveId: string) => {
    const currentPath = `/live/${liveId}`;

    if (!user || user.role !== 1) {
      toast.error("Vui lòng đăng nhập.");
      router.push(
        `/authentication/login?redirect=${encodeURIComponent(currentPath)}`
      );
      return;
    }

    router.push(currentPath);
  };

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
        <>
          {liveStreamList.length === 0 && (
            <div className="text-center text-gray-500 mb-4">
              Hiện không có phiên live nào
            </div>
          )}

          <div className="grid grid-cols-5 justify-between pt-2 gap-2 mb-5">
            {liveStreamList.map((live, index) => (
              <Card
                key={index}
                onClick={() => handleGoLive(live.id)}
                className="p-0 hover:shadow-lg transition-all duration-300 cursor-pointer rounded-none hover:scale-102 shadow-none"
              >
                <div className="aspect-square w-full relative overflow-hidden">
                  <Image
                    src={live.thumbnailUrl}
                    alt={live.title}
                    fill
                    className="object-cover"
                  />

                  {/* LIVE Badge */}
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 z-10 shadow">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>LIVE</span>
                  </div>

                  {/* Text overlay */}
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent px-3 py-2.5 text-white">
                    <div className="text-base font-medium truncate">
                      {live.shopName}
                    </div>
                    <div className="text-sm text-gray-200 truncate min-h-8">
                      {live.title}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default LiveStreaming;
