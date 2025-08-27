"use client";
import React from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  getVouchersByShop,
  VoucherListResponse,
  deleteVoucherById,
} from "@/services/api/voucher/voucher";
import { Voucher } from "@/types/voucher/voucher";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CirclePlus, Edit, MoreVertical, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import DialogUpdateVoucher from "./components/DialogupdateVocher";

export default function VouchersPage() {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [vouchers, setVouchers] = React.useState<Voucher[]>([]);
  const [search, setSearch] = React.useState("");
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedVoucher, setSelectedVoucher] = React.useState<Voucher | null>(
    null
  );
  const [refreshTick, setRefreshTick] = React.useState(0);
  // type filter: "all" | "1" | "2"
  const [typeFilter, setTypeFilter] = React.useState<"all" | "1" | "2">("all");
  // expired filter: "all" | "active" | "expired"
  const [expiredFilter, setExpiredFilter] = React.useState<
    "all" | "active" | "expired"
  >("all");
  // active filter: "all" | "active" | "inactive"
  const [activeFilter, setActiveFilter] = React.useState<
    "all" | "active" | "inactive"
  >("all");
  const [confirmDelete, setConfirmDelete] = React.useState<Voucher | null>(
    null
  );
  const [loadingDelete, setLoadingDelete] = React.useState(false);
  const handleOpenDialog = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setOpenDialog(true);
  };
  React.useEffect(() => {
    if (!user?.shopId) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const params: {
          isActive?: boolean;
          type?: number;
          isExpired?: boolean;
          pageNumber?: number;
          pageSize?: number;
        } = {
          pageNumber: 1,
          pageSize: 50,
        };

        // Map type filter
        if (typeFilter !== "all") {
          params.type = Number(typeFilter);
        }

        // Map expired filter
        if (expiredFilter === "expired") {
          params.isExpired = true;
        } else if (expiredFilter === "active") {
          params.isExpired = false;
        }

        // Map active filter
        if (activeFilter === "active") {
          params.isActive = true;
        } else if (activeFilter === "inactive") {
          params.isActive = false;
        }

        const res: VoucherListResponse = await getVouchersByShop(
          user.shopId,
          params
        );
        setVouchers(res.items ?? []);
      } catch (err) {
        console.error("Fetch vouchers error", err);
        setVouchers([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user?.shopId, typeFilter, expiredFilter, activeFilter, refreshTick]);

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setExpiredFilter("all");
    setActiveFilter("all");
  };

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vouchers;
    return vouchers.filter((v) => {
      const code = v.code?.toLowerCase() || "";
      const desc =
        typeof v.description === "string" ? v.description.toLowerCase() : "";
      return code.includes(q) || desc.includes(q);
    });
  }, [search, vouchers]);

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    try {
      setLoadingDelete(true);
      await deleteVoucherById(String(confirmDelete.id));
      setVouchers((prev) => prev.filter((x) => x.id !== confirmDelete.id));
      toast.success("Đã ngừng hoạt động voucher");
    } catch (err: unknown) {
      console.error("Delete voucher error", err);
      let message = "Ngừng hoạt động thất bại";
      if (typeof err === "object" && err !== null && "response" in err) {
        const resp = (err as { response?: { data?: { message?: string } } })
          .response;
        if (typeof resp?.data?.message === "string") {
          message = resp.data.message;
        }
      }
      toast.error(message);
    } finally {
      setLoadingDelete(false);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 min-h-full">
      <div className="bg-white sticky top-0 z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
        <h2 className="text-xl font-bold">Vouchers (Mã giảm giá)</h2>
        <Link href="/shop/manager-vouchers/new-voucher">
          <Button className="bg-[#B0F847] text-black shadow flex gap-2 py-2 px-4 text-base cursor-pointer hover:bg-[#B0F847]/80 hover:text-black/80">
            <CirclePlus />
            Thêm voucher
          </Button>
        </Link>
      </div>
      <div className="mx-5 mb-10">
        <Card className="bg-white py-5 px-8 min-h-[75vh] space-y-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex-1 max-w-xl relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Search className="text-gray-500" size={18} />
              </span>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo mã hoặc mô tả voucher..."
                className="bg-white pl-9"
              />
            </div>
            <div className="flex gap-3 items-center">
              <Select
                value={typeFilter}
                onValueChange={(v: "all" | "1" | "2") => setTypeFilter(v)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Loại voucher</SelectItem>
                  <SelectItem value="1">Theo %</SelectItem>
                  <SelectItem value="2">Theo số tiền</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={expiredFilter}
                onValueChange={(v: "all" | "active" | "expired") =>
                  setExpiredFilter(v)
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Trạng thái</SelectItem>
                  <SelectItem value="active">Voucher còn hạn</SelectItem>
                  <SelectItem value="expired">Voucher hết hạn</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={activeFilter}
                onValueChange={(v: "all" | "active" | "inactive") =>
                  setActiveFilter(v)
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Hiệu lực" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={resetFilters}
                className="border-blue-500 text-blue-500 cursor-pointer hover:text-blue-400 hover:bg-white hover:border-blue-400"
              >
                Đặt lại
              </Button>
            </div>
          </div>
          {loading ? (
            <div className="space-y-3">
              <div className="h-9 w-full max-w-xl bg-gray-100 animate-pulse rounded" />
              <div className="grid grid-cols-6 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-9 bg-gray-100 animate-pulse rounded"
                  />
                ))}
              </div>
              <div className="border rounded-md overflow-hidden">
                <div className="h-10 bg-gray-100 animate-pulse" />
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-14 border-t bg-gray-50 animate-pulse"
                  />
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div>Chưa có voucher</div>
          ) : (
            <div className="w-full">
              <Table>
                <TableHeader className="bg-[#B0F847]/50">
                  <TableRow>
                    <TableHead className="font-semibold">Mã và Tên</TableHead>
                    <TableHead className="font-semibold">
                      Loại và giá trị
                    </TableHead>{" "}
                    <TableHead className="font-semibold">Điều kiện</TableHead>
                    <TableHead className="font-semibold">
                      Lượt sử dụng
                    </TableHead>
                    <TableHead className="font-semibold">Trạng thái</TableHead>
                    <TableHead className="font-semibold">Thời gian</TableHead>
                    <TableHead className="font-semibold text-right w-24 pr-6">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="py-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="outline"
                              className="font-mono text-xs bg-gray-100 px-4 py-1 rounded-full text-gray-800 border-gray-300"
                            >
                              {v.code}
                            </Badge>
                          </div>
                          <p className="font-medium text-gray-900">
                            {v.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <span className="font-medium text-gray-900">
                            Giảm{" "}
                            {v.type === 1
                              ? `${v.value}%`
                              : `${(v.value || 0).toLocaleString("vi-VN")}₫`}
                          </span>
                          <p className="text-xs text-gray-500">
                            {v.maxValue != null
                              ? `Tối đa ${v.maxValue.toLocaleString("vi-VN")}₫`
                              : "Không giới hạn"}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <span className="font-medium text-gray-900">
                            {v.minOrderAmount && v.minOrderAmount > 0
                              ? v.minOrderAmount.toLocaleString("vi-VN") + "₫"
                              : "Không yêu cầu"}
                          </span>
                          <p className="text-xs text-gray-500">Đơn tối thiểu</p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-2 mr-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-900">
                              {v.usedQuantity}/{v.availableQuantity}
                            </span>
                            <span className="text-xs text-gray-500">
                              {(
                                (v.usedQuantity / v.availableQuantity) *
                                100
                              ).toFixed(0)}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                (v.usedQuantity / v.availableQuantity) * 100 >=
                                80
                                  ? "bg-red-500"
                                  : (v.usedQuantity / v.availableQuantity) *
                                      100 >=
                                    50
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              style={{
                                width: `${(
                                  (v.usedQuantity / v.availableQuantity) *
                                  100
                                ).toFixed(0)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-2">
                        {v.isExpired ? (
                          <span className="text-red-600 font-medium">
                            Hết hạn
                          </span>
                        ) : (
                          <span className="text-green-600 font-medium">
                            Hoạt động
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-2">
                        {new Date(v.startDate).toLocaleDateString()} -{" "}
                        {new Date(v.endDate).toLocaleDateString()}
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
                              className="text-blue-600"
                              onClick={() => handleOpenDialog(v)}
                            >
                              <Edit
                                size={18}
                                className="text-blue-600 flex justify-start"
                              />
                              Cập nhật
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-500"
                              onClick={() => setConfirmDelete(v)}
                            >
                              <Trash2 size={18} className="text-red-500 mr-2" />
                              Ngừng hoạt động
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <AlertDialog
            open={!!confirmDelete}
            onOpenChange={(open) => !open && setConfirmDelete(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn ngừng hoạt động voucher{" "}
                  {confirmDelete?.code}
                  {confirmDelete?.description
                    ? ` - ${confirmDelete?.description}`
                    : ""}
                  ?
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
      </div>
      {selectedVoucher && (
        <DialogUpdateVoucher
          open={openDialog}
          voucher={selectedVoucher}
          onClose={() => setOpenDialog(false)}
          onSuccess={() => setRefreshTick((t) => t + 1)}
        />
      )}
    </div>
  );
}
