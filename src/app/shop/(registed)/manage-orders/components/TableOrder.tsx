import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/AuthContext";
import { getOrdersByShop } from "@/services/api/order/order";
import { type Order } from "@/types/order/order";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { getUserById } from "@/services/api/auth/account";
import { PackageSearch, UserRound } from "lucide-react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { getProductDetailById } from "@/services/api/product/product";
import PriceTag from "@/components/common/PriceTag";
import Link from "next/link";
type TabValue = "all" | "0" | "1,2" | "3" | "4,10" | "5,8,9";

const parseStatusesFromTab = (tab: TabValue): number[] | undefined => {
  if (tab === "all") return undefined;
  return tab.split(",").map((s) => Number(s.trim()));
};

const header = (
  <Card
    className="rounded-none border-none bg-gray-100 text-gray-700 shadow-none grid items-center px-5 py-2 mb-5"
    style={{ gridTemplateColumns: "3.5fr 2fr 2fr 2fr 1fr" }}
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
  const [activeTab, setActiveTab] = useState<TabValue>("all"); // mặc định là "all"
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [accountMap, setAccountMap] = useState<
    Record<string, { username: string; avatarURL: string | null }>
  >({});
  const [itemAttributes, setItemAttributes] = useState<
    Record<string, Record<string, string>>
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

          const map = new Map<string, Order>();
          for (const o of merged) map.set(o.id, o);
          result = Array.from(map.values());
        }
        if (!cancelled) setOrders(result);

        // load thêm thông tin account
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

  useEffect(() => {
    const fetchAttributes = async () => {
      const attrMap: Record<string, Record<string, string>> = {};
      for (const order of orders) {
        for (const item of order.items || []) {
          if (item.productId && item.variantId) {
            try {
              const detail = await getProductDetailById(item.productId);
              const variant = detail?.variants?.find(
                (v: { variantId: string }) => v.variantId === item.variantId
              );
              if (variant) {
                attrMap[item.id] = variant.attributeValues;
              }
            } catch {}
          }
        }
      }
      setItemAttributes(attrMap);
    };
    if (orders.length > 0) fetchAttributes();
  }, [orders]);

  return (
    <Card className="bg-white py-5 px-8 min-h-[75vh]">
      <TabsPrimitive.Root
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
      >
        <TabsPrimitive.List className="flex gap-2 mb-4 border-b">
          {[
            { value: "all", label: "Tất Cả" },
            { value: "0", label: "Chờ xác nhận" },
            { value: "1,2", label: "Chờ lấy hàng" },
            { value: "3", label: "Đang giao" },
            { value: "4,10", label: "Đã giao" },
            { value: "5,8,9", label: "Trả hàng/Hủy" },
          ].map((tab) => (
            <TabsPrimitive.Trigger
              key={tab.value}
              value={tab.value}
              className="px-3 py-2 -mb-px border-b-2 border-transparent 
                         data-[state=active]:border-lime-600 
                         data-[state=active]:text-lime-600 
                         data-[state=active]:font-medium"
            >
              {tab.label}
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>

        <TabsPrimitive.Content value={activeTab}>
          {header}
          {loading ? (
            <>
              {Array.from({ length: 3 }).map((_, idx) => (
                <Card
                  key={idx}
                  className="rounded-none shadow-none px-5 py-3 mb-2 grid items-center"
                  style={{ gridTemplateColumns: "3.5fr 2fr 2fr 2fr 1fr" }}
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
              const attrs = itemAttributes[firstItem?.id];
              return (
                <Card
                  key={order.id}
                  className="p-0 gap-0 rounded-none mb-5 shadow-none "
                >
                  <CardTitle className="bg-gray-100">
                    <div className="flex items-center px-5 justify-between py-2.5 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-2  ">
                        {acc?.avatarURL ? (
                          <Image
                            src={acc.avatarURL}
                            alt={acc.username || "user"}
                            width={20}
                            height={20}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <UserRound size={16} className="text-gray-500" />
                        )}
                        <span className="truncate max-w-[140px]">
                          {acc?.username || "—"}
                        </span>
                      </span>{" "}
                      <span>Mã đơn: {order.orderCode}</span>
                    </div>
                  </CardTitle>
                  <CardContent
                    className="rounded-none shadow-none px-5 py-3  grid "
                    style={{ gridTemplateColumns: "3.5fr 2fr 2fr 2fr 1fr" }}
                  >
                    <div className="flex gap-3 min-w-0">
                      {firstItem ? (
                        <Image
                          src={
                            firstItem.productImageUrl || "/assets/emptydata.png"
                          }
                          alt={firstItem.productName || "Sản phẩm"}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover rounded-none"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded" />
                      )}
                      <div className="flex flex-1 flex-col justify-start mr-8">
                        <div className="flex justify-between gap-2">
                          <p className="text-base truncate pr-2 line-clamp-2 font-medium text-gray-700">
                            {firstItem?.productName || "—"}
                          </p>
                          <p>x {firstItem?.quantity}</p>
                        </div>
                        <div className="flex gap-2 text-[12.5px] mt-2 text-gray-600">
                          {attrs &&
                            Object.entries(attrs)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(", ")}
                        </div>
                      </div>
                    </div>
                    <div className="text-rose-600 font-medium">
                      <PriceTag value={order.finalAmount} />
                    </div>
                    <div>
                      {order.paymentMethod === "COD"
                        ? "Thanh toán COD"
                        : order.paymentMethod === "BankTransfer"
                        ? "Thanh toán QR"
                        : "Không xác định"}
                    </div>

                    <div>
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium
    ${
      order.orderStatus === 0 || order.orderStatus === 1
        ? "bg-yellow-100 text-yellow-700"
        : order.orderStatus === 2
        ? "bg-orange-100 text-orange-700"
        : order.orderStatus === 3
        ? "bg-blue-100 text-blue-700"
        : order.orderStatus === 7
        ? "bg-indigo-100 text-indigo-700"
        : order.orderStatus === 4
        ? "bg-green-100 text-green-700"
        : order.orderStatus === 5
        ? "bg-red-100 text-red-700"
        : order.orderStatus === 10
        ? "bg-emerald-100 text-emerald-700"
        : "bg-gray-100 text-gray-700"
    }`}
                      >
                        {order.orderStatus === 0 || order.orderStatus === 1
                          ? "Chờ xác nhận"
                          : order.orderStatus === 2
                          ? "Chờ xử lí"
                          : order.orderStatus === 3
                          ? "Chờ lấy hàng"
                          : order.orderStatus === 7
                          ? "Chờ giao hàng"
                          : order.orderStatus === 4
                          ? "Giao hàng thành công"
                          : order.orderStatus === 5
                          ? "Đã hủy"
                          : order.orderStatus === 10
                          ? "Thành công"
                          : "Đang giao"}
                      </span>
                    </div>
                    <div className="justify-self-end">
                      <Link href={`/shop/manage-orders/${order.id}`}>
                        <button className="text-blue-500 flex text-sm items-center cursor-pointer gap-2 hover:underline">
                          <PackageSearch size={20} /> Xem chi tiết đơn
                        </button>
                      </Link>
                    </div>
                  </CardContent>
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
