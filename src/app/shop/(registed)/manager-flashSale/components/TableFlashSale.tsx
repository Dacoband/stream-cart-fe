"use client";

import React, { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteFlashSale } from "@/services/api/product/flashSale";
import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { getFlashSalesOverView } from "@/services/api/product/flashSale";
import { FlashSaleOverView, SLOT_TIMES } from "@/types/product/flashSale";
import Image from "next/image";

import { Skeleton } from "@/components/ui/skeleton";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { FormatDate } from "@/components/common/FormatDate";

export default function TableFlashSale() {
  const [filterDate, setFilterDate] = React.useState<string>("");
  const [filterSlot, setFilterSlot] = React.useState<string>("");
  const [confirmDelete, setConfirmDelete] =
    React.useState<FlashSaleOverView | null>(null);
  const [loadingDelete, setLoadingDelete] = React.useState(false);
  const [flashSale, setFlashSale] = React.useState<FlashSaleOverView[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const statusMap: Record<string, { label: string; bg: string; text: string }> =
    {
      Upcoming: {
        label: "Sắp diễn ra",
        bg: "bg-blue-100",
        text: "text-blue-700",
      },
      Active: {
        label: "Đang diễn ra",
        bg: "bg-green-100",
        text: "text-green-700",
      },
      Expired: {
        label: "Đã kết thúc",
        bg: "bg-red-100",
        text: "text-red-700",
      },
    };

  useEffect(() => {
    const fetchFlashSales = async () => {
      setLoading(true);
      try {
        const res = await getFlashSalesOverView();
        setFlashSale(res.data || []);
      } catch (e) {
        console.error("Fetch flash sale products failed", e);
        setFlashSale([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFlashSales();
  }, []);
  const router = useRouter();

  const formatDateQuery = (date: Date | string | number): string => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${year}-${month}-${day}`;
  };
  const handleEdit = (flashSale: FlashSaleOverView) => {
    const formattedDate = formatDateQuery(flashSale.date);
    router.push(
      `/shop/manager-flashSale/list-product?date=${encodeURIComponent(
        formattedDate
      )}&slot=${flashSale.slot}`
    );
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    try {
      setLoadingDelete(true);
      await deleteFlashSale({
        date: confirmDelete.date,
        slot: confirmDelete.slot,
      });
      setFlashSale((prev) =>
        prev.filter(
          (x) => x.date !== confirmDelete.date || x.slot !== confirmDelete.slot
        )
      );
      toast.success("Đã ngừng hoạt động Flash Sale");
    } catch (err: unknown) {
      console.error("Delete Flash Sale error", err);
      toast.error("Xóa Flash Sale thất bại");
    } finally {
      setLoadingDelete(false);
      setConfirmDelete(null);
    }
  };
  // Lọc dữ liệu theo filter
  const filteredFlashSale = flashSale.filter((item) => {
    const matchDate = filterDate
      ? formatDateQuery(item.date) === filterDate
      : true;

    const matchSlot =
      filterSlot && filterSlot !== "all"
        ? String(item.slot) === filterSlot
        : true;

    return matchDate && matchSlot;
  });

  // UI
  return (
    <Card className="bg-white py-5 px-8 min-h-[70vh]">
      {/* Bộ lọc */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Chọn ngày</label>
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-44"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Khung giờ</label>
          <Select value={filterSlot} onValueChange={setFilterSlot}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Tất cả khung giờ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả khung giờ</SelectItem>
              {Object.entries(SLOT_TIMES).map(([slot, val]) => (
                <SelectItem key={slot} value={slot}>
                  {val.start} - {val.end}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          className="h-10 mt-5"
          onClick={() => {
            setFilterDate("");
            setFilterSlot("");
          }}
        >
          Đặt lại
        </Button>
      </div>
      <div className="w-full">
        <Table>
          <TableHeader className="bg-[#B0F847]/50">
            <TableRow>
              <TableHead className="font-semibold pl-6">Ngày</TableHead>
              <TableHead className="font-semibold">Khung giờ</TableHead>
              <TableHead className="font-semibold">Số lượng sản phẩm</TableHead>
              <TableHead className="font-semibold">Trạng thái</TableHead>
              <TableHead className="font-semibold text-right w-24 pr-6">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
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
            ) : filteredFlashSale.length === 0 ? (
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
                      Hiện chưa sản phẩm
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredFlashSale.map((flashSale) => (
                <TableRow key={`${flashSale.date}-${flashSale.slot}`}>
                  <TableCell>
                    <FormatDate date={flashSale.date} />
                  </TableCell>
                  <TableCell>
                    {SLOT_TIMES[flashSale.slot]?.start} -{" "}
                    {SLOT_TIMES[flashSale.slot]?.end}
                  </TableCell>
                  <TableCell>{flashSale.totalProduct}</TableCell>
                  <TableCell>
                    {flashSale.status && (
                      <Badge
                        variant="secondary"
                        className={`${statusMap[flashSale.status]?.bg} ${
                          statusMap[flashSale.status]?.text
                        } font-semibold`}
                      >
                        {statusMap[flashSale.status]?.label || flashSale.status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="ml-auto cursor-pointer bg-white shadow-none hover:bg-white text-black">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleEdit(flashSale)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={() => setConfirmDelete(flashSale)}
                        >
                          <Trash2
                            size={18}
                            className="text-red-500 mr-2 hover:text-red"
                          />
                          Xóa Flash Sale
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa Flash Sale{" "}
              <FormatDate date={confirmDelete?.date ?? ""} /> -{" "}
              {confirmDelete?.slot !== undefined &&
              SLOT_TIMES[confirmDelete.slot]
                ? `${SLOT_TIMES[confirmDelete.slot].start} - ${
                    SLOT_TIMES[confirmDelete.slot].end
                  }`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={loadingDelete}
              onClick={handleConfirmDelete}
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
