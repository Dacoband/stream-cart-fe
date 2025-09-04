"use client";

import React, { useEffect, useMemo, useState } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { PackageSearch } from "lucide-react";

import { getOrders } from "@/services/api/order/order";
import { getshopById } from "@/services/api/shop/shop";
import { type Order } from "@/types/order/order";
import { formatFullDateTimeVN } from "@/components/common/formatFullDateTimeVN";
import PriceTag from "@/components/common/PriceTag";

/* ===========================
   Helpers & constants
=========================== */
const renderStatus = (status: number) => {
  switch (status) {
    case 1:
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
          Chờ xác nhận
        </span>
      );
    case 2:
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700">
          Chờ đóng gói
        </span>
      );
    case 3:
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
          Chờ lấy hàng
        </span>
      );
    case 7:
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
          Chờ giao hàng
        </span>
      );
    case 4:
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
          Giao thành công
        </span>
      );
    case 10:
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
          Thành công
        </span>
      );
    case 5:
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
          Đã hủy
        </span>
      );
    default:
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
          Đang giao
        </span>
      );
  }
};

const renderPayment = (method?: string) => {
  if (method === "COD") return "Thanh toán COD";
  if (method === "BankTransfer") return "Thanh toán QR";
  return "Không xác định";
};

type TabValue = "all" | "1" | "2" | "3" | "4,10" | "5,8,9";
const parseStatusesFromTab = (tab: TabValue): number[] | undefined =>
  tab === "all" ? undefined : tab.split(",").map((s) => Number(s.trim()));

type Props = {
  filters: {
    shopId: string | null;
    startDate: Date | null;
    endDate: Date | null;
    statuses: number[] | null;
  };
};

/** UI page size cố định = 10 */
const UI_PAGE_SIZE = 10;
/** Page size khi fetch từ API để gom dữ liệu (để giảm số lần gọi) */
const API_PAGE_SIZE = 200;
/** Safety: tránh lặp vô hạn nếu BE bug */
const MAX_API_PAGES = 200;

/** Tạo danh sách số trang với dấu ... */
function buildPageList(
  current: number,
  total: number,
  delta = 1
): (number | "...")[] {
  // const range: number[] = []
  const left = Math.max(1, current - delta);
  const right = Math.min(total, current + delta);

  // luôn giữ 1, current +/- delta, total
  const pages = new Set<number>([1, total]);
  for (let i = left; i <= right; i++) pages.add(i);

  const sorted = Array.from(pages).sort((a, b) => a - b);

  const result: (number | "...")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) {
      // nếu gap lớn, thêm ...
      if (p - prev === 2) {
        result.push(prev + 1); // gap = 1 thì hiển thị số giữa luôn
      } else {
        result.push("...");
      }
    }
    result.push(p);
    prev = p;
  }
  return result;
}

export const AllOrderList: React.FC<Props> = ({ filters }) => {
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [loading, setLoading] = useState(false);
  const [allOrders, setAllOrders] = useState<Order[]>([]); // toàn bộ dữ liệu đã gom từ BE
  const [shopMap, setShopMap] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  const tabStatuses = useMemo(
    () => parseStatusesFromTab(activeTab),
    [activeTab]
  );

  // Reset page khi đổi filter/tab
  useEffect(() => {
    setPage(1);
  }, [
    activeTab,
    filters.shopId,
    filters.startDate,
    filters.endDate,
    JSON.stringify(filters.statuses),
  ]);

  // Fetch ALL pages từ BE => lưu vào allOrders
  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const aggregated: Order[] = [];
        let current = 1;
        for (; current <= MAX_API_PAGES; current++) {
          const res = await getOrders({
            shopId: filters.shopId || undefined,
            startDate: filters.startDate?.toISOString(),
            endDate: filters.endDate?.toISOString(),
            pageNumber: current,
            pageSize: API_PAGE_SIZE,
          });
          const items = res?.items ?? [];
          aggregated.push(...items);
          // nếu ít hơn API_PAGE_SIZE => hết trang
          if (items.length < API_PAGE_SIZE) break;
        }
        if (!cancelled) setAllOrders(aggregated);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [filters.shopId, filters.startDate, filters.endDate]);

  // Filter trên TOÀN BỘ dữ liệu đã gom
  const filteredOrders = useMemo(() => {
    let result = allOrders.filter((o) => o.orderStatus !== 0);
    if (tabStatuses)
      result = result.filter((o) => tabStatuses.includes(o.orderStatus));
    if (filters.statuses && filters.statuses.length > 0) {
      result = result.filter((o) => filters.statuses!.includes(o.orderStatus));
    }
    return result;
  }, [allOrders, tabStatuses, filters.statuses]);

  // Tính phân trang ở FE
  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / UI_PAGE_SIZE)
  );
  const start = (page - 1) * UI_PAGE_SIZE;
  const end = start + UI_PAGE_SIZE;
  const pagedOrders = filteredOrders.slice(start, end);

  // Fetch tên shop cho đơn trên TRANG hiện tại
  useEffect(() => {
    const fetchShopsForPage = async () => {
      const ids = Array.from(new Set(pagedOrders.map((o) => o.shopId))).filter(
        Boolean
      );
      const missing = ids.filter((id) => !(id in shopMap));
      if (missing.length === 0) return;

      const results = await Promise.all(
        missing.map(async (id) => {
          try {
            const shop = await getshopById(id);
            return [id, shop?.shopName ?? "—"] as const;
          } catch {
            return [id, "—"] as const;
          }
        })
      );
      setShopMap((prev) => {
        const next = { ...prev };
        for (const [id, name] of results) next[id] = name;
        return next;
      });
    };
    if (pagedOrders.length > 0) fetchShopsForPage();
  }, [pagedOrders, shopMap]);

  const pageList = buildPageList(page, totalPages, 1);

  return (
    <Card className="bg-white py-5 px-8 min-h-[75vh]">
      <TabsPrimitive.Root
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
      >
        {/* Tabs */}
        <TabsPrimitive.List className="flex gap-2 mb-4 border-b overflow-x-auto no-scrollbar -mx-8 px-8">
          {[
            { value: "all", label: "Tất Cả" },
            { value: "1", label: "Chờ xác nhận" },
            { value: "2", label: "Chờ lấy hàng" },
            { value: "3", label: "Đang giao" },
            { value: "4,10", label: "Đã giao" },
            { value: "5,8,9", label: "Trả hàng/Hủy" },
          ].map((tab) => (
            <TabsPrimitive.Trigger
              key={tab.value}
              value={tab.value as TabValue}
              className="px-3 py-2 -mb-px border-b-2 border-transparent
                         data-[state=active]:border-lime-600
                         data-[state=active]:text-lime-600
                         data-[state=active]:font-medium
                         flex-none whitespace-nowrap"
            >
              {tab.label}
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>

        {/* Header */}
        <div className="sticky top-16 z-30 grid grid-cols-[1.5fr_2.5fr_1.5fr_1.5fr_1.5fr_1fr] bg-[#B0F847] px-5 py-2 font-semibold text-gray-800 shadow-sm">
          <div className="pr-2">Cửa hàng</div>
          <div>Sản phẩm</div>
          <div>Tổng thanh toán</div>
          <div>Hình thức thanh toán</div>
          <div>Trạng thái</div>
          <div className="justify-self-end">Thao tác</div>
        </div>

        {/* Content */}
        <div className="max-h-[calc(75vh-180px)] overflow-y-auto">
          <TabsPrimitive.Content value={activeTab}>
            {loading ? (
              <Skeleton className="h-24 w-full" />
            ) : pagedOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Không có đơn hàng
              </div>
            ) : (
              pagedOrders.map((order) => {
                const firstItem = order.items?.[0];
                return (
                  <Card
                    key={order.id}
                    className="p-0 rounded-none mb-5 shadow-none"
                  >
                    <CardTitle className="bg-gray-100">
                      <div className="flex justify-between px-5 py-2.5 text-sm text-gray-500">
                        <span>
                          Thời gian đặt: {formatFullDateTimeVN(order.orderDate)}
                        </span>
                        <span>Mã đơn: {order.orderCode}</span>
                      </div>
                    </CardTitle>
                    <CardContent className="grid grid-cols-[1.5fr_2.5fr_1.5fr_1.5fr_1.5fr_1fr] px-5 py-3">
                      {/* Shop */}
                      <div className="text-gray-700 font-medium truncate pr-4">
                        {shopMap[order.shopId] ?? order.shopId}
                      </div>

                      {/* Product */}
                      <div className="flex gap-3 min-w-0">
                        {firstItem && (
                          <Image
                            src={
                              firstItem.productImageUrl ||
                              "/assets/emptydata.png"
                            }
                            alt={firstItem.productName || "Sản phẩm"}
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover"
                          />
                        )}
                        <div className="flex flex-col flex-1 min-w-0">
                          <p className="font-medium truncate line-clamp-2 text-gray-700">
                            {firstItem?.productName}
                          </p>
                          <p className="text-sm text-gray-500">
                            x {firstItem?.quantity}
                          </p>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-rose-600 font-medium">
                        <PriceTag value={order.finalAmount} />
                      </div>

                      {/* Payment */}
                      <div>{renderPayment(order.paymentMethod)}</div>

                      {/* Status */}
                      <div>{renderStatus(order.orderStatus)}</div>

                      {/* Action */}
                      <div className="justify-self-end">
                        <Link href={`/orders/${order.id}`}>
                          <button className="text-blue-500 hover:underline flex items-center gap-1">
                            <PackageSearch size={16} /> Chi tiết
                          </button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsPrimitive.Content>
        </div>

        {/* Pagination: danh sách trang + input nhảy trang */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            Tổng: {filteredOrders.length} đơn • {totalPages} trang
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Trước
            </button>

            {/* Danh sách số trang (có ...) */}
            <div className="flex items-center gap-1">
              {pageList.map((p, idx) =>
                p === "..." ? (
                  <span key={`dots-${idx}`} className="px-2 text-gray-500">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 rounded-md text-sm border ${
                      p === page
                        ? "bg-lime-600 text-white border-lime-600"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            </div>

            <button
              className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Sau
            </button>

            <div className="ml-2 flex items-center gap-2">
              <span className="text-sm">Trang</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={page}
                onChange={(e) => {
                  let val = Number(e.target.value);
                  if (isNaN(val) || val < 1) val = 1;
                  if (val > totalPages) val = totalPages;
                  setPage(val);
                }}
                className="w-16 border rounded-md px-2 py-1 text-sm text-center"
              />
              <span className="text-sm">/ {totalPages}</span>
            </div>
          </div>
        </div>
      </TabsPrimitive.Root>
    </Card>
  );
};
