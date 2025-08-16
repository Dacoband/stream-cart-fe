import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/AuthContext";
import { getOrdersByShop } from "@/services/api/order/order";
import { type Order } from "@/types/order/order";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { getUserById } from "@/services/api/auth/account";
import { UserRound } from "lucide-react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

type TabValue = "all" | "0" | "1,2" | "3" | "4,10" | "5,8,9";

const parseStatusesFromTab = (tab: TabValue): number[] | undefined => {
  if (tab === "all") return undefined; // undefined means fetch all
  return tab.split(",").map((s) => Number(s.trim()));
};

const header = (
  <Card
    className="rounded-none shadow-none grid items-center px-5 py-2 mb-5"
    style={{ gridTemplateColumns: "4fr 2fr 2fr 2fr 1fr" }}
  >
    <div>Sản phẩm</div>
    <div>Tổng thanh toán</div>
    <div>Hình thức thanh toán</div>
    <div>Trạng thái</div>
    <div>Thao tác</div>
  </Card>
);

function TableOrder() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [accountMap, setAccountMap] = useState<
    Record<string, { username: string; avatarURL: string | null }>
  >({});

  const shopId = user?.shopId;
  const statuses = useMemo(() => parseStatusesFromTab(activeTab), [activeTab]);

  useEffect(() => {
    let cancelled = false;
    const fetchOrders = async () => {
      if (!shopId) return;
      setLoading(true);
      try {
        let result: Order[] = [];
        if (!statuses) {
          const res = await getOrdersByShop(shopId, {
            PageIndex: 1,
            PageSize: 10,
          });
          const items = (res?.data?.items ?? res?.items ?? res) as Order[];
          result = Array.isArray(items) ? items : [];
        } else {
          const calls = await Promise.all(
            statuses.map((st) =>
              getOrdersByShop(shopId, {
                PageIndex: 1,
                PageSize: 10,
                Status: st,
              })
            )
          );
          const merged = calls.flatMap(
            (res) => (res?.data?.items ?? res?.items ?? res) as Order[]
          );
          // De-duplicate by id
          const map = new Map<string, Order>();
          for (const o of merged) map.set(o.id, o);
          result = Array.from(map.values());
        }
        if (!cancelled) setOrders(result);
        // Fetch unique accounts for orders
        const uniqueAccountIds = Array.from(
          new Set(result.map((o) => o.accountId))
        ).filter(Boolean);
        const missing = uniqueAccountIds.filter((id) => !(id in accountMap));
        if (missing.length > 0) {
          const fetched = await Promise.all(
            missing.map(async (id) => {
              try {
                const u = await getUserById(id);
                return [
                  id,
                  {
                    username: u?.username ?? "",
                    avatarURL: u?.avatarURL ?? null,
                  },
                ] as const;
              } catch {
                return [id, { username: "", avatarURL: null }] as const;
              }
            })
          );
          if (!cancelled) {
            setAccountMap((prev) => {
              const next = { ...prev } as Record<
                string,
                { username: string; avatarURL: string | null }
              >;
              for (const [id, info] of fetched) next[id] = info;
              return next;
            });
          }
        }
      } catch {
        if (!cancelled) setOrders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, [shopId, statuses, accountMap]);

  return (
    <Card className="bg-white py-5 px-8 min-h-[75vh]">
      <TabsPrimitive.Root
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
      >
        <TabsPrimitive.List className="flex gap-2 mb-4">
          <TabsPrimitive.Trigger
            className="px-3 py-2 rounded border"
            value="all"
          >
            Tất Cả
          </TabsPrimitive.Trigger>
          <TabsPrimitive.Trigger className="px-3 py-2 rounded border" value="0">
            Chờ xác nhận
          </TabsPrimitive.Trigger>
          <TabsPrimitive.Trigger
            className="px-3 py-2 rounded border"
            value="1,2"
          >
            Chờ lấy hàng
          </TabsPrimitive.Trigger>
          <TabsPrimitive.Trigger className="px-3 py-2 rounded border" value="3">
            Đang giao
          </TabsPrimitive.Trigger>
          <TabsPrimitive.Trigger
            className="px-3 py-2 rounded border"
            value="4,10"
          >
            Đã giao
          </TabsPrimitive.Trigger>
          <TabsPrimitive.Trigger
            className="px-3 py-2 rounded border"
            value="5,8,9"
          >
            Trả hàng/Hủy
          </TabsPrimitive.Trigger>
        </TabsPrimitive.List>

        <TabsPrimitive.Content value={activeTab}>
          {header}
          {loading ? (
            <>
              {Array.from({ length: 3 }).map((_, idx) => (
                <Card
                  key={idx}
                  className="rounded-none shadow-none px-5 py-3 mb-2 grid items-center"
                  style={{ gridTemplateColumns: "4fr 2fr 2fr 2fr 1fr" }}
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-16 h-16" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20 justify-self-end" />
                </Card>
              ))}
            </>
          ) : orders.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Không có đơn hàng
            </div>
          ) : (
            orders.map((order) => {
              const firstItem = order.items?.[0];
              const acc = accountMap[order.accountId];
              return (
                <Card
                  key={order.id}
                  className="rounded-none shadow-none px-5 py-3 mb-2 grid items-center"
                  style={{ gridTemplateColumns: "4fr 2fr 2fr 2fr 1fr" }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {firstItem ? (
                      <Image
                        src={
                          firstItem.productImageUrl || "/assets/emptydata.png"
                        }
                        alt={firstItem.productName || "Sản phẩm"}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium truncate pr-2">
                        {firstItem?.productName || "—"}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Mã đơn: {order.orderCode}</span>
                        <span className="inline-flex items-center gap-1 pl-3 border-l">
                          {acc?.avatarURL ? (
                            <Image
                              src={acc.avatarURL}
                              alt={acc.username || "user"}
                              width={20}
                              height={20}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                          ) : (
                            <UserRound size={16} className="text-gray-500" />
                          )}
                          <span className="truncate max-w-[140px]">
                            {acc?.username || "—"}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="font-semibold">
                    {(order.finalAmount ?? order.totalPrice)?.toLocaleString()}₫
                  </div>
                  <div>—</div>
                  <div>
                    <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="justify-self-end">
                    <button className="text-blue-600 hover:underline">
                      Chi tiết
                    </button>
                  </div>
                </Card>
              );
            })
          )}
        </TabsPrimitive.Content>
      </TabsPrimitive.Root>
    </Card>
  );
}

export default TableOrder;
