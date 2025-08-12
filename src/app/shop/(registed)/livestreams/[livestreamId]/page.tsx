"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getLivestreamById,
  startLivestreamById,
} from "@/services/api/livestream/livestream";
import { Livestream } from "@/types/livestream/livestream";
import { Button } from "@/components/ui/button";
import { Calendar, Play, ArrowLeft } from "lucide-react";
import { formatFullDateTimeVN } from "@/components/common/formatFullDateTimeVN";

export default function LivestreamDetailPage() {
  const { livestreamId } = useParams<{ livestreamId: string }>();
  const router = useRouter();
  const [data, setData] = useState<Livestream | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getLivestreamById(livestreamId);
        setData(res);
      } catch (e) {
        console.error("Load livestream detail error", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [livestreamId]);

  const handleStart = async () => {
    if (!data) return;
    try {
      setStarting(true);
      await startLivestreamById(data.id);
      window.open(`/shop/livestream/${data.id}`, "_blank");
    } catch (e) {
      console.error("Start livestream error", e);
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-sm text-gray-500">Đang tải...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <p className="text-sm text-red-500">Không tìm thấy livestream.</p>
        <Button
          variant="outline"
          className="mt-4 cursor-pointer"
          onClick={() => router.push("/shop/livestreams")}
        >
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="cursor-pointer"
          onClick={() => router.push("/shop/livestreams")}
        >
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-2xl font-bold">{data.title}</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          <div className="w-full aspect-video bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm">
            {data.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.thumbnailUrl}
                alt="thumbnail"
                className="w-full h-full object-cover rounded"
              />
            ) : (
              "No Thumbnail"
            )}
          </div>

          <div className="space-y-2">
            <h2 className="font-semibold text-lg">Mô tả</h2>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {data.description || "Không có mô tả"}
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-semibold text-lg">Thời gian</h2>
            <p className="flex items-center gap-2 text-sm">
              <Calendar size={16} />
              Dự kiến: {formatFullDateTimeVN(data.scheduledStartTime)}
            </p>
            {data.actualStartTime && (
              <p className="text-sm">
                Thực tế: {formatFullDateTimeVN(data.actualStartTime)} {" - "}
                {data.actualEndTime
                  ? formatFullDateTimeVN(data.actualEndTime)
                  : "__"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="font-semibold text-lg">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {data.tags
                ? data.tags.split(",").map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      #{t.trim()}
                    </span>
                  ))
                : "Không có"}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="border rounded p-4 space-y-3">
            <h3 className="font-semibold text-base">Trạng thái</h3>
            <p className="text-sm">
              {data.actualEndTime
                ? "Đã kết thúc"
                : data.actualStartTime
                ? "Đang diễn ra"
                : "Chưa bắt đầu"}
            </p>
            <p className="text-sm">
              Lượt xem cao nhất: {data.maxViewer ?? "—"}
            </p>
            <div className="pt-2">
              {data.actualEndTime ? (
                <Button
                  variant="outline"
                  className="w-full cursor-not-allowed"
                  disabled
                >
                  Đã kết thúc
                </Button>
              ) : data.actualStartTime ? (
                <Button
                  className="w-full bg-lime-600 hover:bg-lime-600/90 cursor-pointer"
                  onClick={() =>
                    window.open(`/shop/livestream/${data.id}`, "_blank")
                  }
                >
                  Vào phòng livestream
                </Button>
              ) : (
                <Button
                  disabled={starting}
                  onClick={handleStart}
                  className="w-full bg-blue-600 hover:bg-blue-600/90 cursor-pointer"
                >
                  <Play size={16} className="mr-2" />
                  {starting ? "Đang khởi động..." : "Bắt đầu ngay"}
                </Button>
              )}
            </div>
          </div>
          <div className="border rounded p-4 space-y-2">
            <h3 className="font-semibold text-base">Thông tin thêm</h3>
            <p className="text-xs text-gray-500">
              ID: <span className="font-mono">{data.id}</span>
            </p>
            <p className="text-xs text-gray-500">
              {/* Tạo bởi: {data.createdBy || "—"} */}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
