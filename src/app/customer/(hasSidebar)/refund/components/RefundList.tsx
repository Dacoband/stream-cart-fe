"use client";

import { useEffect, useState, useCallback } from "react";
import { RefundRequestDto, RefundStatus } from "@/types/refund/refund";
import Loading from "@/components/common/Loading";
import { getUserRefunds } from "@/services/api/refund/refund"; // ← dùng đúng path export getShopRefunds bạn có
import { ShopRefundItemCard } from "./RefundItemCard";

type Props = {
  statuses: RefundStatus[];
  fromDate?: string;
  toDate?: string;
  detailPathPrefix?: string; // ví dụ /manager/refund
};

type Paged<T> = {
  items: T[];
  currentPage?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
};

export function ShopRefundList({
  statuses,
  fromDate,
  toDate,
}: // detailPathPrefix = '/manager/refund',
Props) {
  const [list, setList] = useState<RefundRequestDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
  });

  const fetchPage = useCallback(
    async (pageNumber = 1, append = false) => {
      setLoading(true);
      setError(null);
      try {
        // API shop refunds chỉ nhận 1 status => gọi tuần tự rồi gộp
        const merged: RefundRequestDto[] = [];
        if (statuses.length > 0) {
          for (const s of statuses) {
            const res: Paged<RefundRequestDto> = await getUserRefunds({
              pageNumber,
              pageSize: pagination.pageSize,
              status: s,
              fromDate,
              toDate,
            });
            merged.push(...(res?.items ?? []));
          }
        } else {
          const res: Paged<RefundRequestDto> = await getUserRefunds({
            pageNumber,
            pageSize: pagination.pageSize,
            fromDate,
            toDate,
          });
          merged.push(...(res?.items ?? []));
        }

        // unique theo id
        const uniq = merged.filter(
          (x, i, arr) => i === arr.findIndex((y) => y.id === x.id)
        );

        setList((prev) => (append ? [...prev, ...uniq] : uniq));
        setPagination((prev) => ({
          ...prev,
          pageNumber,
          totalCount:
            uniq.length > prev.totalCount && pageNumber === 1
              ? uniq.length
              : prev.totalCount || uniq.length,
        }));
      } catch (e) {
        console.error(e);
        setError("Không thể tải danh sách yêu cầu hoàn hàng");
      } finally {
        setLoading(false);
      }
    },
    [statuses, fromDate, toDate, pagination.pageSize]
  );

  // Load khi đổi tab / filter
  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  // const handleLoadMore = () => {
  //   // Nếu backend trả totalCount/totalPages chuẩn, bạn có thể thay logic này
  //   fetchPage(pagination.pageNumber + 1, true);
  // };

  if (loading && list.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => fetchPage(1)}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!list || list.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Không có yêu cầu hoàn hàng
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[calc(100vh-15rem)] overflow-y-auto pr-2">
      {list.map((rf) => (
        <ShopRefundItemCard
          key={rf.id}
          refund={rf}
          onChanged={() => fetchPage(1)}
        />
      ))}
    </div>
  );
}
