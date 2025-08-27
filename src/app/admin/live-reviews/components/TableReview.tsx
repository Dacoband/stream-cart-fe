"use client";

import React from "react";
import Image from "next/image";
import { Review } from "@/types/review/review";
import { searchReviews } from "@/services/api/review/review";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatFullDateTimeVN } from "@/components/common/formatFullDateTimeVN";
import { Star } from "lucide-react";

const TableReview: React.FC = () => {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pageNumber, setPageNumber] = React.useState<number>(1);
  const [pageSize] = React.useState<number>(10);
  const [totalCount, setTotalCount] = React.useState<number>(0);

  const isRecord = (v: unknown): v is Record<string, unknown> =>
    !!v && typeof v === "object";
  const num = (v: unknown): number | undefined =>
    typeof v === "number" ? v : undefined;
  const arr = <T,>(v: unknown): T[] | undefined =>
    Array.isArray(v) ? (v as T[]) : undefined;
  // util: lấy đầu ngày, cuối ngày
  const getStartOfDay = (date: Date) => {
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  };

  const getEndOfDay = (date: Date) => {
    date.setHours(23, 59, 59, 999);
    return date.toISOString();
  };

  const [from, setFrom] = React.useState(() => getStartOfDay(new Date()));
  const [to, setTo] = React.useState(() => getEndOfDay(new Date()));
  const resetFilter = () => {
    setFrom(getStartOfDay(new Date()).slice(0, 16));
    setTo(getEndOfDay(new Date()).slice(0, 16));
    setPageNumber(1);
    fetchData();
  };

  const normalize = React.useCallback(
    (res: unknown): { items: Review[]; total: number } => {
      // Case 1: plain array
      if (Array.isArray(res)) {
        const items = res as Review[];
        return { items, total: items.length };
      }
      // Ensure object
      const obj = isRecord(res) ? (res as Record<string, unknown>) : {};

      // Case 2: flat items
      const itemsFlat = arr<Review>(obj["items"]);
      if (itemsFlat) {
        const total =
          num(obj["totalCount"]) ?? num(obj["total"]) ?? itemsFlat.length;
        return { items: itemsFlat, total: total ?? itemsFlat.length };
      }

      // Case 3: flat data
      const dataFlat = arr<Review>(obj["data"]);
      if (dataFlat) {
        const total =
          num(obj["total"]) ?? num(obj["totalCount"]) ?? dataFlat.length;
        return { items: dataFlat, total: total ?? dataFlat.length };
      }

      // Case 4: nested data.items
      const dataObj = isRecord(obj["data"])
        ? (obj["data"] as Record<string, unknown>)
        : undefined;
      const nestedItems = dataObj ? arr<Review>(dataObj["items"]) : undefined;
      if (dataObj && nestedItems) {
        const total =
          num(dataObj["totalCount"]) ??
          num(dataObj["total"]) ??
          nestedItems.length;
        return { items: nestedItems, total: total ?? nestedItems.length };
      }

      // Case 5: records/list
      const records = arr<Review>(obj["records"]) ?? arr<Review>(obj["list"]);
      if (records) {
        const total = num(obj["total"]) ?? records.length;
        return { items: records, total: total ?? records.length };
      }

      // Fallback
      return { items: [], total: 0 };
    },
    []
  );

  const toDateOrUndefined = (v: string | undefined): Date | undefined =>
    v && v.trim() ? new Date(v) : undefined;

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await searchReviews({
        Type: 3,
        PageNumber: pageNumber,
        PageSize: pageSize,
        FromDate: toDateOrUndefined(from),
        ToDate: toDateOrUndefined(to),
      });

      const { items, total } = normalize(res);
      setReviews(items);
      setTotalCount(typeof total === "number" ? total : items.length);
    } catch (e) {
      console.error(e);
      setError("Không thể tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, from, to, normalize]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize));
  const canPrev = pageNumber > 1;
  const canNext = pageNumber < totalPages;

  const applyFilter = () => {
    setPageNumber(1);
    fetchData();
  };

  return (
    <div className="bg-white py-5 px-8 min-h-[75vh] rounded-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between py-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Từ ngày</label>
            <Input
              type="date"
              value={from.slice(0, 10)}
              onChange={(e) => {
                const date = new Date(e.target.value);
                setFrom(getStartOfDay(date));
              }}
              className="w-full sm:w-64"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Đến ngày</label>
            <Input
              type="date"
              value={to.slice(0, 10)}
              onChange={(e) => {
                const date = new Date(e.target.value);
                setTo(getEndOfDay(date));
              }}
              className="w-full sm:w-64"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={applyFilter} className="cursor-pointer">
            Lọc
          </Button>
          <Button
            variant="outline"
            onClick={resetFilter}
            className="cursor-pointer"
          >
            Đặt lại
          </Button>
        </div>
      </div>

      <div className="w-full">
        <Table>
          <TableHeader className="bg-[#B0F847]/50">
            <TableRow>
              <TableHead className="pl-6 font-semibold">
                Người đánh giá
              </TableHead>
              <TableHead className="font-semibold">Tên shop</TableHead>
              <TableHead className="font-semibold">
                Tên livestream
              </TableHead>{" "}
              <TableHead className="font-semibold">Rate</TableHead>{" "}
              <TableHead className="font-semibold">Đánh giá</TableHead>
              <TableHead className="font-semibold">Thời gian</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-40 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-36" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-64" />
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="text-center text-red-600 py-8">{error}</div>
                </TableCell>
              </TableRow>
            ) : !reviews || reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="text-center text-gray-600 py-8">
                    Không có đánh giá nào
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((rv) => (
                <TableRow key={rv.id}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                        {rv.avatarImage ? (
                          <Image
                            src={rv.avatarImage}
                            alt={rv.reviewerName || rv.userName || "avatar"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm">
                            N/A
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {rv.reviewerName || rv.userName || "Ẩn danh"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{rv.shopName || "-"}</TableCell>
                  <TableCell>{rv.livestreamTitle || "-"}</TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-1">
                      <Star
                        size={16}
                        className="text-yellow-500 fill-yellow-400"
                      />
                      <span className="font-medium">
                        {rv.rating?.toFixed?.(1) ?? rv.rating}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="line-clamp-2 max-w-[420px] whitespace-normal break-words">
                      {rv.reviewText || ""}
                    </div>
                  </TableCell>{" "}
                  <TableCell>
                    {rv.createdAt ? formatFullDateTimeVN(rv.createdAt) : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                className={
                  canPrev ? "cursor-pointer" : "opacity-50 pointer-events-none"
                }
                onClick={() =>
                  canPrev && setPageNumber((p) => Math.max(1, p - 1))
                }
              />
            </PaginationItem>

            {/* Simple page numbers: first, current, last if many pages */}
            {totalPages <= 7 ? (
              Array.from({ length: totalPages }).map((_, idx) => {
                const p = idx + 1;
                return (
                  <PaginationItem key={p}>
                    <PaginationLink
                      isActive={p === pageNumber}
                      onClick={() => setPageNumber(p)}
                      className="cursor-pointer"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                );
              })
            ) : (
              <>
                <PaginationItem>
                  <PaginationLink
                    isActive={pageNumber === 1}
                    onClick={() => setPageNumber(1)}
                    className="cursor-pointer"
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <span className="px-2">…</span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink isActive>{pageNumber}</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <span className="px-2">…</span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    isActive={pageNumber === totalPages}
                    onClick={() => setPageNumber(totalPages)}
                    className="cursor-pointer"
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}

            <PaginationItem>
              <PaginationNext
                className={
                  canNext ? "cursor-pointer" : "opacity-50 pointer-events-none"
                }
                onClick={() =>
                  canNext && setPageNumber((p) => Math.min(totalPages, p + 1))
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default TableReview;
