"use client";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Eye,
  UserCircle,
  CircleCheck,
  Circle,
} from "lucide-react";
import Image from "next/image";
import {
  deleteLivestream,
  getJoinLivestream,
  startLivestreamById,
} from "@/services/api/livestream/livestream";
import { formatFullDateTimeVN } from "@/components/common/formatFullDateTimeVN";
import { useAuth } from "@/lib/AuthContext";
import type {
  Livestream,
  LivestreamProduct,
} from "@/types/livestream/livestream";
import AlertDelete from "../../components/AlertDeleteLive";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
interface TabDescripLiveProps {
  livestream: Livestream;
  onReload?: () => void;
  products: LivestreamProduct[];
}

export default function TabDescripLive(props: TabDescripLiveProps) {
  const router = useRouter();
  const { livestream, onReload, products } = props;
  const { user } = useAuth();
  const [confirmDeleteLivestream, setConfirmDeleteLivestream] =
    useState<Livestream | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const getActionLabel = useCallback(
    (ls: Livestream) => {
      if (ls.actualEndTime) return "Đã kết thúc";
      const isHost = user && ls.livestreamHostId === user.id;
      if (ls.status) {
        return isHost ? "Tiếp tục" : "Hỗ trợ live";
      }
      return isHost ? "Bắt đầu" : "Hỗ trợ live";
    },
    [user]
  );
  const handleConfirmDelete = async () => {
    if (!confirmDeleteLivestream) return;
    try {
      setLoadingDelete(true);
      await deleteLivestream(confirmDeleteLivestream.id);
      toast.success("Đã xóa livestream thành công");
      setConfirmDeleteLivestream(null);
      router.push("/shop/livestreams");
    } catch (error) {
      console.error("Fetch Error delete livestream:", error);
      toast.error("Xóa livestream thất bại");
    } finally {
      setLoadingDelete(false);
    }
  };
  const handleStartLivestream = async (id: string) => {
    try {
      // setStarting(true); // removed unused state
      const isHost = user && livestream.livestreamHostId === user.id;
      if (isHost) {
        await startLivestreamById(id);
        window.open(`/shop/livestream/${id}`, "_blank");
        onReload?.();
      } else {
        await getJoinLivestream(id);
        window.open(`/shop/livestream/SupportLive/${id}`, "_blank");
      }
      onReload?.();
    } catch (err) {
      console.error("Error starting livestream:", err);
    } finally {
      // setStarting(false); // removed unused state
    }
  };

  const handleContinueLivestream = (id: string) => {
    try {
      const isHost = user && livestream.livestreamHostId === user.id;
      const url = isHost
        ? `/shop/livestream/${id}`
        : `/shop/livestream/SupportLive/${id}`;
      window.open(url, "_blank");
      onReload?.();
    } catch (err) {
      console.error("Error continuing livestream:", err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full mt-10 mb-5">
      <div className="w-full md:w-1/3 flex-shrink-0">
        <div className="aspect-square rounded-lg overflow-hidden bg-gray-200 relative">
          {livestream.thumbnailUrl ? (
            <Image
              src={livestream.thumbnailUrl}
              alt={livestream.title}
              fill
              className="object-cover"
              priority
              quality={100}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4-4m0 0l4 4m-4-4v12M20 12v8m0 0H8m12 0h-4"
                />
              </svg>
            </div>
          )}

          <div className="absolute top-2 right-2">
            {livestream.status ? (
              <span className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Đang Live
              </span>
            ) : !livestream.actualStartTime ? (
              <span className="flex items-center gap-2 bg-black text-white px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                <Circle
                  className="w-3.5 h-3.5 fill-white text-white"
                  strokeWidth={2}
                />
                Chưa bắt đầu
              </span>
            ) : (
              <span className="flex items-center gap-2 bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                <Circle className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                Đã kết thúc
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 pl-0 md:pl-8">
        <div className="w-full mb-4">
          <h3 className="text-xl md:text-3xl font-bold text-gray-800">
            {livestream.title}
          </h3>

          {livestream.description && (
            <p className="my-2 text-gray-600 text-sm md:text-base max-w-2xl line-clamp-3">
              {livestream.description}
            </p>
          )}

          {livestream.tags && (
            <span className="mb-2 text-xs bg-lime-100 text-lime-600 px-2 py-1 rounded-full">
              # {livestream.tags}
            </span>
          )}
        </div>
        {/* Thông tin thời gian */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex flex-col items-center text-blue-600 bg-blue-100 py-2.5 rounded-sm">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-blue-600 mr-2" />
              <span className="font-medium text-sm">Lịch hẹn:</span>
            </div>
            <span className="ml-1 text-blue-800 mt-0.5 font-medium">
              {livestream.scheduledStartTime
                ? formatFullDateTimeVN(livestream.scheduledStartTime)
                : "__ __"}
            </span>
          </div>
          <div className="flex flex-col items-center text-purple-600 bg-purple-100 py-2.5 rounded-sm">
            <div className="flex items-center">
              <UserCircle className="w-4 h-4 text-purple-600 mr-2" />
              <span className="font-medium text-sm">Người live:</span>
            </div>
            <span className="ml-1 text-purple-800 mt-0.5 font-medium">
              {livestream.livestreamHostName}
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
              {livestream.actualStartTime
                ? formatFullDateTimeVN(livestream.actualStartTime)
                : "__ __"}
            </span>
          </div>
          <div className="flex flex-col items-center text-green-600 bg-green-100 py-2.5 rounded-sm">
            <div className="flex items-center">
              <CircleCheck className="w-4 h-4 text-green-600 mr-2" />
              <span className="font-medium text-sm">Thời gian kết thúc:</span>
            </div>
            <span className="ml-1 text-green-800 mt-0.5 font-medium">
              {livestream.actualEndTime
                ? formatFullDateTimeVN(livestream.actualEndTime)
                : "__ __"}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4 ">
          <div className="flex flex-col items-center text-orange-600 bg-orange-100 py-2.5 rounded-sm">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-orange-600 mr-2" />
              <span className="font-medium text-sm">Số lượng sản phẩm:</span>
            </div>
            <span className="ml-1 text-orange-800 mt-0.5 font-medium">
              {products ? products.length : 0}
            </span>
          </div>
          <div className="flex flex-col items-center text-yellow-600 bg-yellow-100 py-2.5 rounded-sm">
            <div className="flex items-center">
              <Eye className="w-4 h-4 text-yellow-600 mr-2" />
              <span className="font-medium text-sm">Lượt xem:</span>
            </div>
            <span className="ml-1 text-yellow-800 mt-0.5 font-medium">
              {typeof livestream.maxViewer === "number"
                ? livestream.maxViewer
                : "__ __"}
            </span>
          </div>
        </div>
        {/* Trạng thái và nút hành động */}
        <div className="flex justify-end items-center gap-3 mt-6">
          {(() => {
            const now = new Date();
            const scheduled = new Date(livestream.scheduledStartTime);
            const isScheduledUpcoming =
              scheduled > now && !livestream.actualStartTime;

            if (isScheduledUpcoming) {
              return (
                <div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                    className="text-orange-700 border-orange-500 bg-white cursor-not-allowed"
                  >
                    Sắp diễn ra
                  </Button>{" "}
                  <Button>Cập nhật LiveStream</Button>
                  <Button
                    variant="destructive"
                    onClick={() => setConfirmDeleteLivestream(livestream)}
                  >
                    Xóa Live Stream
                  </Button>
                </div>
              );
            }

            if (livestream.status) {
              // Trạng thái đang Live
              return (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-lime-600 border-lime-600 cursor-pointer hover:text-lime-400 hover:border-lime-400 hover:bg-white bg-white"
                  onClick={() => handleContinueLivestream(livestream.id)}
                >
                  {getActionLabel(livestream)}
                </Button>
              );
            }

            return (
              <Button
                size="sm"
                variant="outline"
                className={
                  livestream.actualEndTime
                    ? "text-gray-700 border-gray-500 cursor-not-allowed bg-white"
                    : "text-blue-600 border-blue-600 cursor-pointer hover:text-blue-400 hover:border-blue-400 hover:bg-white"
                }
                onClick={() =>
                  !livestream.actualEndTime &&
                  handleStartLivestream(livestream.id)
                }
                disabled={!!livestream.actualEndTime}
              >
                {getActionLabel(livestream)}
              </Button>
            );
          })()}
        </div>
        <AlertDelete
          open={!!confirmDeleteLivestream}
          livestream={confirmDeleteLivestream}
          loading={loadingDelete}
          onCancel={() => setConfirmDeleteLivestream(null)}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </div>
  );
}
