"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { getLivestreamById } from "@/services/api/livestream/livestream";
import { Livestream } from "@/types/livestream/livestream";
import { createReview } from "@/services/api/review/review";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  CircleCheck,
  Clock,
  Eye,
  Star,
  UserCircle,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { formatFullDateTimeVN } from "@/components/common/formatFullDateTimeVN";

export default function Page() {
  const { livestreamId } = useParams<{ livestreamId: string }>();
  const router = useRouter();

  const [live, setLive] = React.useState<Livestream | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState<number | null>(null);
  const [reviewText, setReviewText] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getLivestreamById(livestreamId);
        if (mounted) setLive(data as Livestream);
      } catch (err) {
        console.error("Failed to load livestream", err);
        if (mounted) setError("Không thể tải thông tin livestream");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [livestreamId]);

  const onSubmit = async () => {
    if (!livestreamId) return;
    if (!rating || rating < 1 || rating > 5) {
      setError("Vui lòng chọn số sao đánh giá");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await createReview({
        orderID: null,
        productID: null,
        livestreamId: String(livestreamId),
        rating,
        reviewText: reviewText.trim() ? reviewText.trim() : null,
        imageUrls: null,
      });
      toast.success("Gửi đánh giá thành công");
      setSubmitted(true);
    } catch (e) {
      console.error(e);
      toast.error("Gửi đánh giá thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToLivestream = () => {
    router.push(`/shop/livestreams/${livestreamId}`);
  };

  return (
    <div className="mx-auto">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={handleBackToLivestream}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại Livestream
        </Button>
      </div>

      <h1 className="text-2xl md:text-2xl mt-4 font-bold text-gray-900 text-center">
        Đánh giá buổi Livestream
      </h1>
      <p className="text-center text-gray-500 mt-1 mb-6">
        Chia sẻ trải nghiệm livestream bán hàng của bạn
      </p>

      {/* Livestream info */}
      <Card className="bg-white p-4 w-[80%] mx-auto rounded-none">
        {loading ? (
          <div className="h-24 animate-pulse bg-gray-100 rounded" />
        ) : live ? (
          <div className="flex items-start gap-4">
            <div className="w-[280px] flex flex-col justify-center items-center">
              <Image
                src={
                  live.thumbnailUrl ||
                  "https://via.placeholder.com/400x400?text=Livestream"
                }
                alt={live.title}
                width={150}
                height={150}
                className=" aspect-square object-cover rounded-none"
              />
              <div className="w-full mb-4 flex flex-col justify-between items-center">
                <h3 className="text-xl md:text-3xl font-bold text-gray-800">
                  {live.title}
                </h3>

                {/* Tags */}
                {live.tags && (
                  <span className="mb-2 text-xs bg-lime-100 text-lime-600 px-2 py-1 rounded-full">
                    # {live.tags}
                  </span>
                )}
              </div>
            </div>
            <div className=" flex-1  pl-8 ">
              {/* Tiêu đề */}

              {/* Thông tin thời gian */}
              <div className="grid grid-cols-2 gap-4 ">
                <div className="flex flex-col items-center text-blue-600 bg-blue-100 py-2.5 rounded-sm">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="font-medium text-sm">Lịch hẹn:</span>
                  </div>
                  <span className="ml-1 text-blue-800 mt-0.5 font-medium">
                    {live.scheduledStartTime
                      ? formatFullDateTimeVN(live.scheduledStartTime)
                      : "__ __"}
                  </span>
                </div>
                <div className="flex flex-col items-center text-purple-600 bg-purple-100 py-2.5 rounded-sm">
                  <div className="flex items-center">
                    <UserCircle className="w-4 h-4 text-purple-600 mr-2" />
                    <span className="font-medium text-sm">Người live:</span>
                  </div>
                  <span className="ml-1 text-purple-800 mt-0.5 font-medium">
                    {live.livestreamHostName}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 ">
                <div className="flex flex-col items-center text-red-600 bg-red-100 py-2.5 rounded-sm">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-red-600 mr-2" />
                    <span className="font-medium text-sm">Bắt đầu:</span>
                  </div>
                  <span className="ml-1 text-red-800 mt-0.5 font-medium">
                    {live.actualStartTime
                      ? formatFullDateTimeVN(live.actualStartTime)
                      : "__ __"}
                  </span>
                </div>
                <div className="flex flex-col items-center text-green-600 bg-green-100 py-2.5 rounded-sm">
                  <div className="flex items-center">
                    <CircleCheck className="w-4 h-4 text-green-600 mr-2" />
                    <span className="font-medium text-sm">
                      Thời gian kết thúc:
                    </span>
                  </div>
                  <span className="ml-1 text-green-800 mt-0.5 font-medium">
                    {live.actualEndTime
                      ? formatFullDateTimeVN(live.actualEndTime)
                      : "__ __"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 ">
                <div className="flex flex-col items-center text-orange-600 bg-orange-100 py-2.5 rounded-sm">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-orange-600 mr-2" />
                    <span className="font-medium text-sm">Đơn hàng:</span>
                  </div>
                  <span className="ml-1 text-orange-800 mt-0.5 font-medium">
                    {live.scheduledStartTime
                      ? formatFullDateTimeVN(live.scheduledStartTime)
                      : "__ __"}
                  </span>
                </div>
                <div className="flex flex-col items-center text-yellow-600 bg-yellow-100 py-2.5 rounded-sm">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 text-yellow-600 mr-2" />
                    <span className="font-medium text-sm">Lượt xem:</span>
                  </div>
                  <span className="ml-1 text-yellow-800 mt-0.5 font-medium">
                    {live.maxViewer}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-red-500">
            {error ?? "Không có dữ liệu"}
          </div>
        )}
      </Card>

      {/* Overall rating */}
      <Card className="bg-white p-4 w-[80%]  mb-5 mx-auto rounded-none mt-5">
        <h2 className="text-xl font-semibold">Đánh giá tổng quan</h2>
        <p className="text-gray-600 mt-2">
          Bạn cảm thấy buổi shop livestream này như thế nào?
        </p>
        <div className="mt-2 flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => {
            const active = (hover ?? rating) >= i;
            return (
              <button
                key={i}
                type="button"
                className="p-1"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setRating(i)}
                aria-label={`Chọn ${i} sao`}
              >
                <Star
                  size={36}
                  className={active ? "text-yellow-400" : "text-gray-300"}
                  fill={active ? "currentColor" : "none"}
                />
              </button>
            );
          })}
        </div>
        <div className="mt-6">
          <label className="block text-sm mb-2 text-red-700">*Nhận xét</label>
          <Textarea
            placeholder="Chia sẻ trải nghiệm của bạn..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

        <div className="mt-6 flex justify-between items-center">
          {!submitted ? (
            <>
              <Button
                variant="outline"
                onClick={handleBackToLivestream}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </Button>
              <Button
                className="bg-[#B0F847] hover:bg-[#B0F847]/80 text-black"
                disabled={submitting || !reviewText.trim()}
                onClick={onSubmit}
              >
                {submitting ? "Đang gửi..." : "Gửi đánh giá"}
              </Button>
            </>
          ) : (
            <div className="w-full flex flex-col items-center gap-4">
              <span className="text-green-600 font-medium">
                Cảm ơn bạn đã gửi đánh giá.
              </span>
              <Button
                onClick={handleBackToLivestream}
                className="bg-[#B0F847] hover:bg-[#B0F847]/80 text-black flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại Livestream
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
