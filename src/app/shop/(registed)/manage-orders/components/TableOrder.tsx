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
import { formatFullDateTimeVN } from "@/components/common/formatFullDateTimeVN";
import { getShopRefunds } from "@/services/api/refund/refund";
import { RefundRequestDto, RefundStatus } from "@/types/refund/refund";
import { getOrderById } from "@/services/api/order/order";
import { updateRefundStatus } from "@/services/api/refund/refund";
type TabValue = "all" | "1,2" | "3" | "7" | "4,10" | "5" | "8,9";

const parseStatusesFromTab = (tab: TabValue): number[] | undefined => {
  if (tab === "all") return undefined;
  return tab.split(",").map((s) => Number(s.trim()));
};

// Header will adapt style; when tab is "Hoàn hàng" ("8,9"), copy the green
// header styling approach from RefundRequestTable

function TableOrder() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [accountMap, setAccountMap] = useState<
    Record<string, { username: string; avatarURL: string | null }>
  >({});
  const [itemAttributes, setItemAttributes] = useState<
    Record<string, Record<string, string>>
  >({});
  const [refunds, setRefunds] = useState<
    (RefundRequestDto & { orderCode?: string; processedByName?: string })[]
  >([]);
  const [completingIds, setCompletingIds] = useState<Record<string, boolean>>(
    {}
  );
  const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

  const shopId = user?.shopId;
  const statuses = useMemo(() => parseStatusesFromTab(activeTab), [activeTab]);

  // Build header: switch to refund header when tab is "Hoàn hàng" ("8,9")
  const header = (
    <Card
      className={
        activeTab === "8,9"
          ? "rounded-md border-none bg-[#B0F847] text-gray-800 shadow-sm grid items-center px-5 py-2 mb-5 font-semibold"
          : "rounded-none border-none bg-gray-100 text-gray-700 shadow-none grid items-center px-5 py-2 mb-5"
      }
      style={{
        gridTemplateColumns:
          activeTab === "8,9"
            ? "1.3fr 1.1fr 1.1fr 1.6fr 1.3fr 1fr"
            : "3.5fr 2fr 2fr 2fr 1fr",
      }}
    >
      {activeTab === "8,9" ? (
        <>
          <div>Mã đơn hàng</div>
          <div>Số tiền hoàn</div>
          <div>Trạng thái</div>
          <div>Được xử lý bởi</div>
          <div>Mã giao dịch</div>
          <div className="justify-self-end">Thao tác</div>
        </>
      ) : (
        <>
          <div>Sản phẩm</div>
          <div>Tổng thanh toán</div>
          <div>Hình thức thanh toán</div>
          <div>Trạng thái</div>
          <div>Thao tác</div>
        </>
      )}
    </Card>
  );

  const renderRefundStatus = (status: RefundStatus) => {
    return (
      <span
        className={
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium " +
          (status === RefundStatus.Created
            ? "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200"
            : status === RefundStatus.Completed
            ? "bg-green-100 text-green-800 ring-1 ring-green-200"
            : status === RefundStatus.Refunded
            ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200"
            : status === RefundStatus.Rejected
            ? "bg-red-100 text-red-700 ring-1 ring-red-200"
            : "bg-blue-100 text-blue-800 ring-1 ring-blue-200")
        }
      >
        {status === RefundStatus.Created
          ? "Gửi yêu cầu"
          : status === RefundStatus.Completed
          ? "Hoàn hàng thành công"
          : status === RefundStatus.Refunded
          ? "Hoàn tiền thành công"
          : status === RefundStatus.Rejected
          ? "Bị từ chối"
          : "Đang xử lý"}
      </span>
    );
  };

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
        // For "all" tab, exclude status 0 as requested
        if (!statuses) {
          result = result.filter((o) => o.orderStatus !== 0);
        }
        if (!cancelled) setOrders(result);

        // Khi tab "Hoàn hàng" được chọn, gọi thêm API getShopRefunds và lưu kết quả
        if (activeTab === "8,9") {
          try {
            const res = await getShopRefunds({ pageNumber: 1, pageSize: 10 });
            const list = (res?.items ?? res ?? []) as (RefundRequestDto & {
              orderCode?: string;
              processedByName?: string;
            })[];
            if (!cancelled) setRefunds(Array.isArray(list) ? list : []);
          } catch {
            // noop
          }
        }

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
  }, [shopId, statuses, accountMap, activeTab]);

  // Fetch refunds like manager/refund/page.tsx when tab "Hoàn hàng" active
  useEffect(() => {
    if (activeTab !== "8,9") return;
    let cancelled = false;

    const API_PAGE_SIZE = 200;
    const MAX_API_PAGES = 200;

    const fetchRefunds = async () => {
      setLoading(true);
      try {
        const aggregated: RefundRequestDto[] = [];
        for (let pageNumber = 1; pageNumber <= MAX_API_PAGES; pageNumber++) {
          const res = await getShopRefunds({
            pageNumber,
            pageSize: API_PAGE_SIZE,
          });
          const items = (res?.items ?? []) as RefundRequestDto[];
          aggregated.push(...items);
          if (items.length < API_PAGE_SIZE) break;
        }

        // Enrich orderCode and processedByName
        const orderCodeCache = new Map<string, string>();
        const userNameCache = new Map<string, string>();

        const enriched: (RefundRequestDto & {
          orderCode?: string;
          processedByName?: string;
        })[] = [];
        for (const r of aggregated) {
          let orderCode: string | undefined = (
            r as Partial<RefundRequestDto> & { orderCode?: string }
          ).orderCode;
          if (!orderCode && r.orderId) {
            if (orderCodeCache.has(r.orderId)) {
              orderCode = orderCodeCache.get(r.orderId)!;
            } else {
              try {
                const ord = await getOrderById(r.orderId);
                const code =
                  ord?.data?.data?.orderCode ??
                  ord?.data?.orderCode ??
                  ord?.orderCode;
                if (code) {
                  orderCode = code;
                  orderCodeCache.set(r.orderId, code);
                }
              } catch {
                // ignore
              }
            }
          }

          let processedByName: string | undefined = undefined;
          const emptyGuid = "00000000-0000-0000-0000-000000000000";
          if (r.lastModifiedBy && r.lastModifiedBy !== emptyGuid) {
            if (userNameCache.has(r.lastModifiedBy)) {
              processedByName = userNameCache.get(r.lastModifiedBy)!;
            } else {
              try {
                const u = await getUserById(r.lastModifiedBy);
                const name =
                  u?.fullname ||
                  u?.fullName ||
                  u?.username ||
                  u?.email ||
                  r.lastModifiedBy;
                processedByName = name;
                userNameCache.set(r.lastModifiedBy, name);
              } catch {
                processedByName = r.lastModifiedBy;
              }
            }
          }

          enriched.push({ ...r, orderCode, processedByName });
        }

        if (!cancelled) setRefunds(enriched);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRefunds();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

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
        <div className="sticky top-16 z-0 bg-white">
          <TabsPrimitive.List className="flex gap-2 mb-4 border-b">
            {[
              { value: "all", label: "Tất Cả" },
              { value: "1,2", label: "Chờ xác nhận" },
              { value: "3", label: "Chờ lấy hàng" },
              { value: "7", label: "Đang giao" },
              { value: "4,10", label: "Đã giao" },
              { value: "5", label: "Đã hủy" },
              { value: "8,9", label: "Hoàn hàng" },
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
          {header}
        </div>

        <TabsPrimitive.Content value={activeTab}>
          {loading ? (
            <>
              {Array.from({ length: 3 }).map((_, idx) => (
                <Card
                  key={idx}
                  className="rounded-none shadow-none px-5 py-3 mb-2 grid items-center"
                  style={{
                    gridTemplateColumns:
                      activeTab === "8,9"
                        ? "1.3fr 1.1fr 1.1fr 1.6fr 1.3fr 1fr"
                        : "3.5fr 2fr 2fr 2fr 1fr",
                  }}
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
          ) : activeTab === "8,9" ? (
            refunds.length === 0 ? (
              <div>
                <Image
                  src="/assets/emptydata.png"
                  alt="No data"
                  width={180}
                  height={200}
                  className="mt-14 mx-auto"
                />
                <div className="text-center mt-4 text-xl text-lime-700/60  font-medium">
                  Chưa có yêu cầu hoàn hàng
                </div>
              </div>
            ) : (
              refunds.map((refund) => (
                <Card
                  key={refund.id}
                  className="p-0 gap-0 rounded-none mb-5 shadow-none "
                >
                  <CardTitle className="bg-gray-100">
                    <div className="flex items-center px-5 justify-between py-2.5 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-2  ">
                        <span className="truncate max-w-[140px]">
                          Mã yêu cầu: {refund.id}
                        </span>
                        <div className="ml-2 pl-4 border-l-2 border-gray-500">
                          Ngày yêu cầu:{" "}
                          {formatFullDateTimeVN(refund.requestedAt)}
                        </div>
                      </span>
                    </div>
                  </CardTitle>
                  <CardContent
                    className="rounded-none shadow-none px-5 py-3  grid "
                    style={{
                      gridTemplateColumns: "1.3fr 1.1fr 1.1fr 1.6fr 1.3fr 1fr",
                    }}
                  >
                    <div className="flex gap-3 min-w-0">
                      <div className="flex flex-1 flex-col justify-start mr-8">
                        <p className="text-base truncate pr-2 line-clamp-2 font-medium text-gray-700">
                          {refund.orderCode ?? "—"}
                        </p>
                      </div>
                    </div>
                    <div className="text-rose-600 font-medium">
                      <PriceTag value={refund.refundAmount} />
                    </div>
                    <div>{renderRefundStatus(refund.status)}</div>
                    <div className="text-sm text-gray-700">
                      {!refund.lastModifiedAt ||
                      refund.lastModifiedBy === EMPTY_GUID ? (
                        <span className="italic text-gray-500">
                          Chưa được xử lý
                        </span>
                      ) : (
                        <div className="flex flex-col leading-tight">
                          <span className="font-medium text-gray-800">
                            {refund.processedByName ??
                              refund.lastModifiedBy ??
                              "—"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatFullDateTimeVN(refund.lastModifiedAt)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs md:text-sm text-gray-800 font-mono truncate">
                      {refund.status === RefundStatus.Refunded
                        ? refund.transactionId ?? "—"
                        : "—"}
                    </div>
                    <div className="justify-self-end flex flex-col items-end gap-2">
                      <Link href={`/shop/manage-orders/order/${refund.id}`}>
                        <button className="px-3 py-1.5 border rounded-lg text-sm shadow-sm hover:bg-blue-50 text-blue-600 border-blue-200 flex items-center gap-1 whitespace-nowrap">
                          <PackageSearch size={16} /> Chi tiết
                        </button>
                      </Link>
                      {refund.status !== RefundStatus.Completed && (
                        <button
                          disabled={!!completingIds[refund.id]}
                          onClick={async () => {
                            try {
                              setCompletingIds((m) => ({
                                ...m,
                                [refund.id]: true,
                              }));
                              await updateRefundStatus({
                                refundRequestId: refund.id,
                                newStatus: RefundStatus.Completed,
                              });
                              setRefunds((prev) =>
                                prev.map((r) =>
                                  r.id === refund.id
                                    ? { ...r, status: RefundStatus.Completed }
                                    : r
                                )
                              );
                            } finally {
                              setCompletingIds((m) => ({
                                ...m,
                                [refund.id]: false,
                              }));
                            }
                          }}
                          className="px-3 py-1.5 border rounded-lg text-sm shadow-sm text-green-700 border-green-200 hover:bg-green-50 whitespace-nowrap disabled:opacity-50"
                        >
                          {completingIds[refund.id]
                            ? "Đang nhận…"
                            : "Nhận hàng"}
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )
          ) : orders.length === 0 ? (
            <div>
              <Image
                src="/assets/emptydata.png"
                alt="No data"
                width={180}
                height={200}
                className="mt-14 mx-auto"
              />
              <div className="text-center mt-4 text-xl text-lime-700/60  font-medium">
                Hiện chưa có đơn nào
              </div>
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
                        <div className="ml-2 pl-4 border-l-2 border-gray-500">
                          {" "}
                          Thời gian đặt: {formatFullDateTimeVN(order.orderDate)}
                        </div>
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
                        <div className="flex justify-between gap-2 items-start min-w-0">
                          <p className="text-base pr-2 line-clamp-2 font-medium text-gray-700 flex-1 min-w-0">
                            {firstItem?.productName || "—"}
                          </p>
                          <p className="flex-shrink-0 ml-2">
                            x {firstItem?.quantity}
                          </p>
                        </div>
                        <div className="flex gap-2 text-[12.5px] mt-2 text-gray-600 flex-wrap break-words">
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
                        : "Thanh toán QR"}
                    </div>

                    <div>
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium
    ${
      order.orderStatus === 1
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
                        {order.orderStatus === 1
                          ? "Chờ xác nhận"
                          : order.orderStatus === 2
                          ? "Chờ đóng gói"
                          : order.orderStatus === 3
                          ? "Chờ lấy hàng"
                          : order.orderStatus === 7
                          ? "Đang giao hàng"
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
