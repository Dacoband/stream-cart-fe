"use client";
import React from "react";
import { Membership } from "@/types/membership/membership";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Crown, Edit, MoreVertical, Search, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import PriceTag from "@/components/common/PriceTag";
import { formatDateVN } from "@/components/common/FormatDate";
import { DeleteMembership } from "@/services/api/membership/membership";
import { toast } from "sonner";

interface TableMembershipProps {
  membership:
    | Membership[]
    | { memberships?: Membership[]; totalItems?: number };
  loading: boolean;
  fetchMembership: () => void;
  onEdit?: (m: Membership) => void;
}

// Export name to match usage in page.tsx
export function TableMemberShip({
  membership,
  loading,
  fetchMembership,
  onEdit,
}: TableMembershipProps) {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<"all" | "active" | "deleted">(
    "all"
  );
  const [sortDir, setSortDir] = React.useState<"0" | "1">("0");
  const [page, setPage] = React.useState(1);
  const pageSize = 8;
  const [loadingDelete, setLoadingDelete] = React.useState(false);
  const [toDelete, setToDelete] = React.useState<{
    id: string;
    name: string;
  } | null>(null);

  const filtered = React.useMemo(() => {
    // Support both array prop and API shape { memberships: Membership[], totalItems }
    const source: Membership[] = Array.isArray(membership)
      ? membership
      : (membership as unknown as { memberships?: Membership[] })
          ?.memberships || [];

    let items = [...source];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter((m) => m.name?.toLowerCase().includes(q));
    }
    if (status !== "all") {
      const wantDeleted = status === "deleted";
      items = items.filter((m) => Boolean(m.isDeleted) === wantDeleted);
    }
    items.sort((a, b) => {
      const av = a.price ?? 0;
      const bv = b.price ?? 0;
      return sortDir === "0" ? av - bv : bv - av;
    });
    return items;
  }, [membership, search, status, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  React.useEffect(() => {
    // clamp page when filters change
    setPage(1);
  }, [search, status, sortDir]);

  const pageItems = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setSortDir("0");
    setPage(1);
  };

  const handleDelete = async (id: string, name?: string) => {
    setLoadingDelete(true);
    try {
      await DeleteMembership(id);
      toast.success(
        name
          ? `Đã ngừng hoạt động gói "${name}"`
          : "Đã ngừng hoạt động gói thành công"
      );
      fetchMembership();
    } catch {
      toast.error(
        name ? `Không thể ngừng hoạt động gói "${name}"` : "Thao tác thất bại"
      );
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <Card className="bg-white py-5 px-8 min-h-[75vh]">
      <div className="flex items-center gap-3 py-4">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search className="text-gray-600" />
          </span>
          <Input
            placeholder="Tìm kiếm tên gói..."
            className="w-full pl-12 pr-10 py-5"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
            >
              ✕
            </button>
          )}
        </div>

        <div className="w-[180px]">
          <Select
            value={status}
            onValueChange={(v: string) =>
              setStatus(v as "all" | "active" | "deleted")
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="deleted">Đã xóa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-[180px]">
          <Select
            value={sortDir}
            onValueChange={(v: string) => setSortDir(v as "0" | "1")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Giá tăng dần</SelectItem>
              <SelectItem value="1">Giá giảm dần</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          className="border-blue-500 text-blue-500 cursor-pointer hover:text-blue-400 hover:bg-white hover:border-blue-400"
          onClick={resetFilters}
        >
          Đặt lại
        </Button>
      </div>

      <div className="w-full">
        <Table>
          <TableHeader className="bg-[#B0F847]/50">
            <TableRow>
              <TableHead className="font-semibold pl-6">
                Thông tin gói
              </TableHead>
              <TableHead className="font-semibold">Giá</TableHead>
              <TableHead className="font-semibold">
                Giới hạn thời gian
              </TableHead>
              <TableHead className="font-semibold">Hoa hồng(%)</TableHead>
              <TableHead className="font-semibold">Cập nhật</TableHead>
              <TableHead className="font-semibold">Trạng thái</TableHead>
              <TableHead className="font-semibold text-right w-24 pr-6">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-6">
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-28" />
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : pageItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="py-10">
                    <Image
                      src="/assets/emptyData.png"
                      alt="No data"
                      width={180}
                      height={200}
                      className="mt-2 mx-auto"
                    />
                    <div className="text-center mt-4 text-xl text-lime-700/60 font-medium">
                      Hiện chưa có gói nào
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((m) => (
                <TableRow key={m.membershipId}>
                  <TableCell className="pl-6">
                    <div className="flex gap-2 items-center">
                      <div className="w-16 h-16 flex items-center justify-center rounded-full">
                        {(() => {
                          const raw = String(m.type ?? "");
                          const t = raw.toLowerCase();

                          if (t === "0" || t === "renewal") {
                            return (
                              <div className="flex items-center justify-center w-12 h-12 rounded-sm  bg-gradient-to-r from-blue-400 to-purple-500 text-white">
                                <Star className="w-6 h-6" />
                              </div>
                            );
                          }

                          if (t === "1" || t === "new") {
                            return (
                              <div className="flex items-center justify-center w-12 h-12 rounded-sm bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                                <Crown className="w-6 h-6" />
                              </div>
                            );
                          }

                          return null;
                        })()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {m.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {(() => {
                            const raw = String(m.type ?? "");
                            const t = raw.toLowerCase();
                            if (t === "1" || t === "new") return "Gói chính";
                            if (t === "0" || t === "renewal") return "Gói phụ";
                            return raw;
                          })()}{" "}
                          • {m.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-rose-600 font-medium">
                    <PriceTag value={m.price} />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-700 space-y-1">
                      {m.maxLivestream} phút
                    </div>
                  </TableCell>
                  <TableCell>{m.commission}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 items-baseline">
                      {m.updatedAt ? (
                        <p>{formatDateVN(m.updatedAt as unknown as string)}</p>
                      ) : (
                        <p> {formatDateVN(m.createdAt as unknown as string)}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-sm font-medium ${
                          m.isDeleted
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            m.isDeleted ? "bg-red-600" : "bg-green-600"
                          }`}
                        />
                        {m.isDeleted ? "Ngừng hoạt động" : "Hoạt động"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer"
                        >
                          <MoreVertical size={22} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-blue-600"
                          onClick={() => onEdit?.(m)}
                        >
                          <Edit size={18} className="text-blue-600 mr-2" /> Cập
                          nhật
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500"
                          disabled={loadingDelete}
                          onClick={() =>
                            setToDelete({ id: m.membershipId, name: m.name })
                          }
                        >
                          <Trash2 size={18} className="text-red-500 mr-2" />{" "}
                          Ngừng hoạt động
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

      {/* Confirm delete dialog */}
      <AlertDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận ngừng hoạt động</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete ? (
                <>
                  Bạn có chắc muốn ngừng hoạt động gói{" "}
                  <span className="font-semibold">
                    &quot;{toDelete.name}&quot;
                  </span>
                  ? Hành động này có thể ảnh hưởng tới cửa hàng đang sử dụng
                  gói.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loadingDelete}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={loadingDelete}
              onClick={async () => {
                if (!toDelete) return;
                await handleDelete(toDelete.id, toDelete.name);
                setToDelete(null);
              }}
            >
              {loadingDelete ? "Đang xử lý..." : "Xác nhận"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem className="cursor-pointer">
              <PaginationPrevious
                onClick={() => page > 1 && setPage((p) => p - 1)}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <PaginationItem key={idx} className="cursor-pointer">
                <PaginationLink
                  isActive={page === idx + 1}
                  onClick={() => setPage(idx + 1)}
                >
                  {idx + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem className="cursor-pointer">
              <PaginationNext
                onClick={() => page < totalPages && setPage((p) => p + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </Card>
  );
}

// Also export with the original name for flexibility
export { TableMemberShip as TableMembership };
