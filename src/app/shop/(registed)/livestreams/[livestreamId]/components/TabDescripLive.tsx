"use client";
import { useState } from "react";
import { Livestream } from "@/types/livestream/livestream";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Eye, RotateCw } from "lucide-react";
import { formatFullDateTimeVN } from "@/components/common/formatFullDateTimeVN";
import { startLivestreamById } from "@/services/api/livestream/livestream";

interface TabDescripLiveProps {
  livestream: Livestream;
  onReload?: () => void; // reload chi tiết sau khi start
}

export default function TabDescripLive({
  livestream,
  onReload,
}: TabDescripLiveProps) {
  const [starting, setStarting] = useState(false);

  const statusText = livestream.actualEndTime
    ? "Đã kết thúc"
    : livestream.actualStartTime
    ? "Đang diễn ra"
    : "Chưa bắt đầu";

  const handleStartLivestream = async (id: string) => {
    if (starting) return;
    try {
      setStarting(true);
      await startLivestreamById(id);
      window.open(`/shop/livestream/${id}`, "_blank");
      onReload?.();
    } catch (err) {
      console.error("Error starting livestream:", err);
    } finally {
      setStarting(false);
    }
  };

  const handleContinueLivestream = (id: string) => {
    window.open(`/shop/livestream/${id}`, "_blank");
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Trạng thái & hành động */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="px-4 py-2 rounded bg-gray-100 text-sm font-medium">
          Trạng thái:{" "}
          <span
            className={
              livestream.actualEndTime
                ? "text-gray-600"
                : livestream.actualStartTime
                ? "text-green-600"
                : "text-blue-600"
            }
          >
            {statusText}
          </span>
        </div>

        <div className="px-4 py-2 rounded bg-gray-100 text-sm font-medium flex items-center gap-2">
          <Eye size={16} className="text-gray-500" />
          Max viewers: {livestream.maxViewer ?? "—"}
        </div>

        {/* Logic nút theo yêu cầu snippet: livestream.status ? Continue : Start */}
        {livestream.status ? (
          <Button
            size="sm"
            variant="outline"
            className="text-lime-600 border-lime-600 cursor-pointer hover:text-lime-500 hover:border-lime-500 hover:bg-white bg-white"
            onClick={() => handleContinueLivestream(livestream.id)}
          >
            Tiếp tục livestream
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className={
              livestream.actualEndTime
                ? "text-gray-600 border-gray-400 cursor-not-allowed bg-white"
                : "text-blue-600 border-blue-600 cursor-pointer hover:text-blue-500 hover:border-blue-500 hover:bg-white"
            }
            onClick={() =>
              !livestream.actualEndTime && handleStartLivestream(livestream.id)
            }
            disabled={!!livestream.actualEndTime || starting}
          >
            {livestream.actualEndTime ? (
              "Đã kết thúc"
            ) : starting ? (
              <span className="flex items-center gap-1">
                <RotateCw size={14} className="animate-spin" />
                Đang khởi động...
              </span>
            ) : (
              "Bắt đầu livestream"
            )}
          </Button>
        )}

        {/* Nút thay thế thông minh dựa vào actualStartTime nếu muốn:
            {!livestream.status && livestream.actualStartTime && !livestream.actualEndTime && (
              <Button ...>Tiếp tục phòng phát</Button>
            )} */}
      </div>

      {/* Thời gian */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Thời gian</h3>
        <div className="space-y-2 text-sm">
          <p className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-500" />
            Lịch dự kiến: {formatFullDateTimeVN(livestream.scheduledStartTime)}
          </p>
          {livestream.actualStartTime && (
            <p className="flex items-center gap-2">
              <Clock size={16} className="text-gray-500" />
              Thực tế: {formatFullDateTimeVN(livestream.actualStartTime)}{" "}
              {" - "}
              {livestream.actualEndTime
                ? formatFullDateTimeVN(livestream.actualEndTime)
                : "__"}
            </p>
          )}
        </div>
      </div>

      {/* Mô tả */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Mô tả</h3>
        <p className="text-sm leading-relaxed whitespace-pre-line text-gray-700">
          {livestream.description || "Không có mô tả"}
        </p>
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Tags</h3>
        {livestream.tags ? (
          <div className="flex flex-wrap gap-2">
            {livestream.tags.split(",").map((t) => (
              <span
                key={t}
                className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
              >
                #{t.trim()}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Không có tags</p>
        )}
      </div>
    </div>
  );
}
