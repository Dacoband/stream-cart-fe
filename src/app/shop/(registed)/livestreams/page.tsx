"use client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  CirclePlus,
  LayoutList,
  MoreVertical,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/AuthContext";
import {
  getLivestreamByShopId,
  startLivestreamById,
  deleteLivestream,
  getJoinLivestream,
} from "@/services/api/livestream/livestream";
import { Livestream } from "@/types/livestream/livestream";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatFullDateTimeVN } from "@/components/common/formatFullDateTimeVN";
import AlertDelete from "./components/AlertDeleteLive";
import { toast } from "sonner";
function LiveStreamPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [livestreams, setLivestreams] = useState<Livestream[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [confirmDeleteLivestream, setConfirmDeleteLivestream] =
    useState<Livestream | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const router = useRouter();
  // Determine the correct label based on host and livestream state
  const getActionLabel = React.useCallback(
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
  const fetchLivestreams = React.useCallback(async () => {
    try {
      if (!user?.shopId) return;
      const response = await getLivestreamByShopId(user.shopId);
      setLivestreams(response);
    } catch (error) {
      console.error("Fetch Error List Livestreams:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.shopId]);

  useEffect(() => {
    fetchLivestreams();
  }, [user?.shopId, fetchLivestreams]);
  const handleStartLivestream = async (id: string) => {
    try {
      const ls = livestreams.find((l) => l.id === id);
      const isHost = ls && user && ls.livestreamHostId === user.id;

      if (isHost) {
        await startLivestreamById(id);
        window.open(`/shop/livestream/${id}`, "_blank");
        fetchLivestreams();
      } else {
        await getJoinLivestream(id);
        // Not the host: only join support live, do not start
        window.open(`/shop/livestream/SupportLive/${id}`, "_blank");
      }
    } catch (err) {
      console.error("Error starting livestream:", err);
    }
  };

  const handleContinueLivestream = (id: string) => {
    try {
      const ls = livestreams.find((l) => l.id === id);
      const isHost = ls && user && ls.livestreamHostId === user.id;
      const url = isHost
        ? `/shop/livestream/${id}`
        : `/shop/livestream/SupportLive/${id}`;
      window.open(url, "_blank");
      fetchLivestreams();
    } catch (err) {
      console.error("Error starting livestream:", err);
    }
  };
  const filteredLivestreams = livestreams.filter((item) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleConfirmDelete = async () => {
    if (!confirmDeleteLivestream) return;
    try {
      setLoadingDelete(true);
      await deleteLivestream(confirmDeleteLivestream.id);
      toast.success("Đã xóa livestream thành công");
      setConfirmDeleteLivestream(null);
      fetchLivestreams();
    } catch (error) {
      console.error("Fetch Error delete livestream:", error);
      toast.error("Xóa livestream thất bại");
    } finally {
      setLoadingDelete(false);
    }
  };
  return (
    <div className="flex flex-col gap-5 min-h-full">
      <div className="bg-white sticky top-0 z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
        <h2 className="text-xl font-bold">LiveStream</h2>
        <Link href="/shop/livestreams/new-livestream">
          <Button className="bg-[#B0F847] text-black shadow flex gap-2 py-2 px-4 text-base cursor-pointer hover:bg-[#B0F847]/80 hover:text-black/80">
            <CirclePlus />
            Tạo Livestream
          </Button>
        </Link>
      </div>
      <div className="mx-5 mb-10">
        <Card className="bg-white py-5 px-8 min-h-[75vh]">
          <div className="flex items-center gap-3 py-4">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Search className="text-gray-600" />
              </span>

              <Input
                placeholder="Tìm kiếm tiêu đề live..."
                className="w-full pl-12 pr-10 py-5"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full">
            <Table>
              <TableHeader className="bg-[#B0F847]/50  ">
                <TableRow className="">
                  <TableHead className="font-semibold  pl-6">
                    Tên buổi LiveStream
                  </TableHead>
                  <TableHead className="font-semibold ">
                    Thời gian bắt đầu và kết thúc
                  </TableHead>
                  <TableHead className="font-semibold ">Người Live</TableHead>
                  <TableHead className="font-semibold ">Tags</TableHead>
                  <TableHead className="font-semibold ">Lượt xem</TableHead>

                  <TableHead className="font-semibold ">Trạng thái</TableHead>
                  <TableHead className="font-semibold text-right w-24 pr-6">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Skeleton loading
                  Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>

                      <TableCell className="text-right">
                        <Skeleton className="h-4 w-20 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : livestreams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div>
                        <Image
                          src="/assets/emptydata.png"
                          alt="No data"
                          width={180}
                          height={200}
                          className="mt-14 mx-auto"
                        />
                        <div className="text-center mt-4 text-xl text-lime-700/60  font-medium">
                          Hiện chưa có LiveStream nào
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLivestreams.map((livestream) => (
                    <TableRow key={livestream.id} className="">
                      <TableCell className="pl-5">
                        <div className="flex items-start gap-4  h-24 py-2">
                          <Image
                            src={
                              livestream.thumbnailUrl &&
                              livestream.thumbnailUrl.startsWith("http") &&
                              !livestream.thumbnailUrl.endsWith("/create")
                                ? livestream.thumbnailUrl
                                : "/assets/emptydata.png"
                            }
                            height={80}
                            width={80}
                            alt={livestream.title || "Thumbnail"}
                            className="w-20 h-20 object-cover rounded"
                          />

                          <div>
                            <p className="font-semibold text-base text-gray-900 line-clamp-2 break-words whitespace-normal max-w-[305px]">
                              {livestream.title}
                            </p>

                            <p>
                              <span>Lịch dự kiến: </span>
                              {formatFullDateTimeVN(
                                livestream.scheduledStartTime
                              )}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className=" align-middle ">
                        <div className="flex items-center  gap-2">
                          <Calendar size={14} className="shrink-0" />
                          {livestream.actualStartTime ? (
                            <span>
                              {formatFullDateTimeVN(livestream.actualStartTime)}
                              {" - "}
                              {livestream.actualEndTime
                                ? formatFullDateTimeVN(livestream.actualEndTime)
                                : "__"}
                            </span>
                          ) : (
                            <span>Chưa diễn ra</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{livestream.livestreamHostName}</TableCell>
                      <TableCell>{livestream.tags}</TableCell>

                      <TableCell>
                        <div className="flex gap-2  items-baseline">
                          {livestream.maxViewer ?? "_ _"}
                        </div>
                      </TableCell>

                      <TableCell>
                        {livestream.status ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-lime-600 border-lime-600 cursor-pointer hover:text-lime-400 hover:border-lime-400 hover:bg-white bg-white"
                            onClick={() =>
                              handleContinueLivestream(livestream.id)
                            }
                          >
                            {getActionLabel(livestream)}
                          </Button>
                        ) : (
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
                        )}
                      </TableCell>

                      <TableCell className="text-right pr-5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="cursor-pointer"
                            >
                              <MoreVertical size={25} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/shop/livestreams/${livestream.id}`
                                )
                              }
                              className="text-blue-600 hover:text-blue-600 cursor-pointer"
                            >
                              <LayoutList
                                size={18}
                                className="text-blue-600 flex justify-start"
                              />
                              Xem chi tiết
                            </DropdownMenuItem>
                            {!livestream.actualStartTime && (
                              <DropdownMenuItem
                                className="text-red-500 hover:text-red-500 cursor-pointer"
                                onClick={() =>
                                  setConfirmDeleteLivestream(livestream)
                                }
                              >
                                <Trash2 size={18} className="text-red-500 " />
                                Xóa LiveStream
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
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

export default LiveStreamPage;
