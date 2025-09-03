"use client";

import { Card } from "@/components/ui/card";
import React from "react";
import Image from "next/image";
import { Eye, Users } from "lucide-react";

interface LivestreamData {
  id: string;
  title: string;
  shopName: string;
  thumbnailUrl?: string;
  viewerCount: number;
  startTime: string;
  status: string;
}

function ActiveLivestreams() {
  const [loading, setLoading] = React.useState(true);
  const [activeStreams, setActiveStreams] = React.useState<LivestreamData[]>([]);

  React.useEffect(() => {
    const fetchActiveLivestreams = async () => {
      setLoading(true);
      try {
        // TODO: Gọi API thực tế: https://brightpa.me/api/livestreams/active?promotedOnly=true
        const response = await fetch('https://brightpa.me/api/livestreams/active?promotedOnly=true');
        
        if (response.ok) {
          const data = await response.json();
          setActiveStreams(data.data || []);
        } else {
          // Sử dụng dữ liệu demo nếu API lỗi
          setActiveStreams([]);
        }
      } catch (err) {
        console.error('Error fetching active livestreams:', err);
        // Dữ liệu demo để test UI
        const demoData: LivestreamData[] = [
          {
            id: "1",
            title: "Flash Sale - Giảm giá 50% tất cả sản phẩm",
            shopName: "Shop Thời Trang ABC",
            thumbnailUrl: "/assets/10.png",
            viewerCount: 245,
            startTime: "14:30",
            status: "live"
          },
          {
            id: "2", 
            title: "Review sản phẩm mới - iPhone 15 Pro Max",
            shopName: "Tech Store XYZ",
            thumbnailUrl: "/assets/11.png",
            viewerCount: 189,
            startTime: "15:00",
            status: "live"
          },
          {
            id: "3",
            title: "Livestream bán hàng - Mỹ phẩm chính hãng",
            shopName: "Beauty Shop",
            thumbnailUrl: "/assets/12.png", 
            viewerCount: 156,
            startTime: "15:15",
            status: "live"
          }
        ];
        setActiveStreams(demoData);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveLivestreams();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchActiveLivestreams, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-xl">Livestream đang hoạt động</h3>
          <p className="text-gray-500 text-sm">Danh sách các buổi live đang diễn ra</p>
        </div>
        <div className="flex items-center gap-2 text-red-500">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold">LIVE</span>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-20 h-16 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeStreams.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Eye className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="font-semibold text-gray-600 mb-2">Chưa có livestream nào đang hoạt động</h4>
            <p className="text-sm text-gray-500">Các buổi livestream sẽ hiển thị ở đây khi được bắt đầu</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="space-y-4 flex-1 overflow-y-auto">
            {activeStreams.map((stream) => (
            <div key={stream.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition">
              <div className="relative w-20 h-16 shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                {stream.thumbnailUrl ? (
                  <Image 
                    src={stream.thumbnailUrl} 
                    alt={stream.title}
                    width={80}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">
                  LIVE
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate mb-1">{stream.title}</h4>
                <p className="text-xs text-gray-500 mb-1">{stream.shopName}</p>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{stream.viewerCount} người xem</span>
                  </div>
                  <div>Bắt đầu: {stream.startTime}</div>
                </div>
              </div>
            </div>
            ))}
          </div>

          {activeStreams.length > 0 && (
            <div className="mt-4 pt-4 border-t flex-shrink-0">
              <div className="text-center text-sm text-gray-500">
                Tổng {activeStreams.length} livestream đang hoạt động
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default ActiveLivestreams;
