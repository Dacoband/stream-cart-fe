"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  Cog,
  User2,
  Store,
  Phone,
  Mail,
  IdCard,
} from "lucide-react";
// import { useRouter } from "next/navigation";
// import { useRouter } from 'next/navigation'

import {
  filterWalletTransactions,
  updateWalletTransactionStatus,
} from "@/services/api/wallet/walletTransaction";
import {
  WalletTransactionDTO,
  WalletTransactionStatus,
  WalletTransactionType,
} from "@/types/wallet/walletTransactionDTO";
import { getAllShops, getshopById } from "@/services/api/shop/shop";
import { getWalletById, getWalletShopId } from "@/services/api/wallet/wallet";
import { getUserById, getUserByShopId } from "@/services/api/auth/account";

import Filters from "./components/Filter";
import AdminTxTable from "./components/AdminTxTable";
import DetailsModal from "./components/DetailTransaction";

/* =====================
   TYPES
===================== */
type TxStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELED" | "RETRY";

type Row = {
  id: string;
  shopId: string;
  shopName?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  ownerId?: string;

  type: number | string;
  amount: number;
  status: TxStatus;
  createdAt: string;
  processedAt?: string | null;
  transactionId?: string | null;
  description?: string | null;

  bankName?: string;
  bankNumber?: string;

  createdBy?: string;
  updatedBy?: string;
  updatedAt?: string | null;
};
type WalletTransactionDTOLoose = WalletTransactionDTO & {
  // các biến thể khóa có thể xuất hiện từ backend
  createdBy?: string | null;
  createdby?: string | null;
  updatedBy?: string | null;
  modifiedby?: string | null;
  lastModifiedBy?: string | null;

  // đôi khi bank info cũng nằm ngay trên transaction
  bankAccount?: string | null;
  bankNumber?: string | null;
};

type ShopOption = { id: string; shopName: string };
type ShopSummary = { id: string; shopName: string };

type AllShopsResponse =
  | { data?: { items?: ShopSummary[] } }
  | { items?: ShopSummary[] };

type ShopByIdResponse = {
  data?: { shopName?: string; id?: string };
  shopName?: string;
  id?: string;
};

type WalletById = {
  shopId?: string;
  bankName?: string;
  bankAccountNumber?: string;
};

type WalletShopResponse =
  | { data?: { bankName?: string; bankAccountNumber?: string } }
  | { bankName?: string; bankAccountNumber?: string };

type UserDTO = {
  id?: string;
  fullname?: string;
  username?: string;
  phoneNumber?: string;
  email?: string;
  role?: number | string;
};

type UserByShopIdResponse = UserDTO[] | { data?: UserDTO[] } | UserDTO;

/* =====================
   UTILS
===================== */
const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n
  );

const formatDT = (d: string | Date) => {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("vi-VN", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const toStartIso = (d?: string) =>
  d ? new Date(d + "T00:00:00").toISOString() : undefined;
const toEndIso = (d?: string) =>
  d ? new Date(d + "T23:59:59.999").toISOString() : undefined;

const isNonEmptyString = (s: unknown): s is string =>
  typeof s === "string" && s.trim().length > 0;

// const asStr = (v: unknown): string | undefined =>
//   typeof v === 'string' && v.trim().length > 0 ? v : undefined

// status (number|string) -> literal
const mapStatusToLiteral = (s: number | string): TxStatus => {
  if (typeof s === "number") {
    if (s === 0) return "COMPLETED";
    if (s === 2) return "PENDING";
    if (s === 3) return "CANCELED";
    return "FAILED";
  }
  const v = String(s).toLowerCase();
  if (v === "success") return "COMPLETED";
  if (v === "retry") return "RETRY";
  if (v === "pending") return "PENDING";
  if (v === "canceled" || v === "cancelled") return "CANCELED";
  return "FAILED";
};

// tx type -> label/icon/tone
const txTypeVN = (t: number | string) => {
  const n = typeof t === "string" ? t.toLowerCase() : t;
  if (n === WalletTransactionType.Withdraw || n === "withdraw")
    return {
      label: "Rút tiền",
      icon: ArrowDownLeft,
      tone: "text-red-600 bg-red-50",
    };
  if (n === WalletTransactionType.Deposit || n === "deposit")
    return {
      label: "Nạp tiền",
      icon: ArrowUpRight,
      tone: "text-green-600 bg-green-50",
    };
  if (n === WalletTransactionType.Commission || n === "commission")
    return {
      label: "Hoa hồng",
      icon: Wallet,
      tone: "text-teal-600 bg-teal-50",
    };
  return { label: "Hệ thống", icon: Cog, tone: "text-slate-700 bg-slate-50" };
};

const StatusBadge = ({ status }: { status: TxStatus }) => {
  const map = {
    COMPLETED: {
      label: "Hoàn thành",
      cls: "bg-green-100 text-green-700 border-green-200",
    },
    PENDING: {
      label: "Đang xử lý",
      cls: "bg-yellow-100 text-yellow-700 border-yellow-200",
    },
    RETRY: {
      label: "Xử lý lại",
      cls: "bg-orange-100 text-orange-700 border-orange-200",
    },
    CANCELED: {
      label: "Đã hủy",
      cls: "bg-gray-100 text-gray-700 border-gray-200",
    },
    FAILED: {
      label: "Thất bại",
      cls: "bg-red-100 text-red-700 border-red-200",
    },
  } as const;
  const s = map[status];
  return <Badge className={`px-2 ${s.cls}`}>{s.label}</Badge>;
};

const DateCell = ({
  createdAt,
  processedAt,
}: {
  createdAt: string | Date;
  processedAt?: string | Date | null;
}) => (
  <div className="flex flex-col">
    <span>{formatDT(createdAt)}</span>
    {processedAt && (
      <span className="text-xs text-muted-foreground">
        Xử lý: {formatDT(processedAt)}
      </span>
    )}
  </div>
);

/* =====================
   API SHAPES HELPERS
===================== */
// getAllShops() -> rút danh sách shop
const extractShopList = (resp: AllShopsResponse): ShopSummary[] => {
  if ("data" in resp && Array.isArray(resp.data?.items))
    return resp.data!.items!;
  if ("items" in resp && Array.isArray(resp.items)) return resp.items!;
  return [];
};

// getshopById() -> lấy tên shop
const extractShopName = (resp?: ShopByIdResponse): string | undefined => {
  if (!resp) return undefined;
  return resp.data?.shopName ?? resp.shopName;
};

// normalize: mảng | {data: mảng} | object đơn -> mảng
const normalizeToArray = <T,>(v: T[] | { data?: T[] } | T): T[] => {
  if (Array.isArray(v)) return v;
  if (typeof v === "object" && v !== null) {
    if (Array.isArray((v as { data?: T[] }).data))
      return (v as { data: T[] }).data;
    return [v as T];
  }
  return [];
};

// ưu tiên chọn seller (role === 2)
const pickSeller = (resp: UserByShopIdResponse): UserDTO => {
  const arr = normalizeToArray<UserDTO>(resp);
  if (!arr.length) {
    return {
      id: undefined,
      fullname: undefined,
      username: undefined,
      phoneNumber: undefined,
      email: undefined,
    };
  }
  const seller =
    arr.find((u) => u?.role === 2 || String(u?.role) === "2") ?? arr[0];
  return {
    id: seller?.id,
    fullname: seller?.fullname,
    username: seller?.username,
    phoneNumber: seller?.phoneNumber,
    email: seller?.email,
  };
};

/* =====================
   PAGE
===================== */
export default function AdminTransactionsPage() {
  const [tab, setTab] = React.useState<"all" | "needs">("all");

  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<number | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = React.useState<number | "ALL">("ALL");
  const [shopId, setShopId] = React.useState<string>("ALL");
  const [shopOptions, setShopOptions] = React.useState<ShopOption[]>([
    { id: "ALL", shopName: "— Tất cả shop —" },
  ]);

  const [pageIndex, setPageIndex] = React.useState(1);
  const pageSize = 20;
  const [totalPage, setTotalPage] = React.useState(1);

  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(false);

  // details modal
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [detailsLoading, setDetailsLoading] = React.useState(false);
  const [detailsTx, setDetailsTx] = React.useState<Row | undefined>(undefined);

  // const router = useRouter()
  // const [submitting, setSubmitting] = React.useState(false)
  // const [txAmount, setTxAmount] = React.useState<string>('')

  // const handleWithdrawConfirm = async (): Promise<void> => {
  //   if (submitting) return
  //   const value = Number(txAmount)
  //   if (!Number.isFinite(value) || value <= 0) {
  //     toast.error('Số tiền phải lớn hơn 0')
  //     return
  //   }
  //   if (value < 51_000) {
  //     toast.error('Số tiền rút tối thiểu là 51.000đ')
  //     return
  //   }
  //   try {
  //     setSubmitting(true)
  //     await router.push(
  //       `/manager/transaction/withdraw?amount=${encodeURIComponent(
  //         String(value)
  //       )}`
  //     )
  //   } catch {
  //     toast.error('Có lỗi xảy ra, vui lòng thử lại')
  //   } finally {
  //     setSubmitting(false)
  //   }
  // }

  // load shop options
  React.useEffect(() => {
    (async () => {
      try {
        const res: AllShopsResponse = await getAllShops({
          pageNumber: 1,
          pageSize: 100,
          status: "",
          approvalStatus: "",
          searchTerm: "",
          sortBy: "createdAt",
          ascending: false,
        });
        const list = extractShopList(res).map((x) => ({
          id: x.id,
          shopName: x.shopName,
        }));
        setShopOptions([{ id: "ALL", shopName: "— Tất cả shop —" }, ...list]);
      } catch {
        // ignore
      }
    })();
  }, []);

  // map shopId -> name (ưu tiên options, thiếu mới gọi API)
  const buildShopNameMap = async (
    ids: string[],
    options: ShopOption[]
  ): Promise<Map<string, string>> => {
    const map = new Map<string, string>();
    for (const s of options) {
      if (isNonEmptyString(s.id) && isNonEmptyString(s.shopName)) {
        map.set(String(s.id), s.shopName);
      }
    }
    const missing = ids.filter((id) => id && !map.has(id));
    if (missing.length) {
      const results = await Promise.allSettled<ShopByIdResponse>(
        missing.map((id) => getshopById(id) as Promise<ShopByIdResponse>)
      );
      results.forEach((r, i) => {
        if (r.status === "fulfilled") {
          const name = extractShopName(r.value);
          if (isNonEmptyString(name)) map.set(missing[i], name);
        }
      });
    }
    return map;
  };

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const types =
        typeFilter === "ALL"
          ? [
              WalletTransactionType.Withdraw,
              WalletTransactionType.Deposit,
              WalletTransactionType.Commission,
              WalletTransactionType.System,
            ]
          : [typeFilter];
      const statuses =
        tab === "needs" || statusFilter === "ALL" ? undefined : [statusFilter];

      // 1) list giao dịch
      const res = await filterWalletTransactions({
        ShopId: shopId === "ALL" ? "" : shopId,
        Types: types,
        Status: statuses,
        FromTime: toStartIso(fromDate),
        ToTime: toEndIso(toDate),
        PageIndex: pageIndex,
        PageSize: pageSize,
      });

      const items: WalletTransactionDTO[] = Array.isArray(res.items)
        ? res.items
        : [];
      setTotalPage(typeof res.totalPage === "number" ? res.totalPage : 1);

      // 2) wallet -> shopId + bank info
      const walletIds = Array.from(
        new Set(
          items
            .map((it) => String(it.walletId || "").trim())
            .filter((x) => x.length > 0)
        )
      );

      const walletMap = new Map<string, WalletById>();
      await Promise.all(
        walletIds.map(async (wid) => {
          try {
            const w: WalletById = await getWalletById(wid);
            walletMap.set(wid, {
              shopId: isNonEmptyString(w?.shopId) ? w.shopId : undefined,
              bankName: isNonEmptyString(w?.bankName) ? w.bankName : undefined,
              bankAccountNumber: isNonEmptyString(w?.bankAccountNumber)
                ? w.bankAccountNumber
                : undefined,
            });
          } catch {
            /* ignore */
          }
        })
      );

      // 3) tên shop
      const shopIds = Array.from(
        new Set(
          walletIds
            .map((wid) => walletMap.get(wid)?.shopId)
            .filter((x): x is string => typeof x === "string" && x.length > 0)
        )
      );
      const shopNameMap = await buildShopNameMap(shopIds, shopOptions);

      // 4) map về Row
      const firstNonEmpty = (
        ...vals: Array<string | null | undefined>
      ): string | undefined => {
        for (const v of vals) {
          if (typeof v === "string" && v.trim().length > 0) return v;
        }
        return undefined;
      };

      const mapped: Row[] = items.map((raw) => {
        const it = raw as WalletTransactionDTOLoose;

        const wid = String(it.walletId || "").trim();
        const wm = walletMap.get(wid);
        const sid = wm?.shopId ?? "";

        return {
          id: it.id,
          shopId: sid,
          shopName: sid ? shopNameMap.get(sid) ?? "—" : "—",
          type: it.type,
          amount: it.amount,
          status: mapStatusToLiteral(it.status),
          createdAt: it.createdAt,
          processedAt: it.lastModifiedAt ?? it.updatedAt ?? null,
          transactionId: it.transactionId ?? null,
          description: it.description ?? null,

          bankName: firstNonEmpty(it.bankAccount, wm?.bankName),
          bankNumber: firstNonEmpty(it.bankNumber, wm?.bankAccountNumber),

          createdBy: firstNonEmpty(it.createdBy, it.createdby),
          updatedBy: firstNonEmpty(
            it.lastModifiedBy,
            it.updatedBy,
            it.modifiedby
          ),
          updatedAt: it.lastModifiedAt ?? it.updatedAt ?? null,
        };
      });

      const needRow = (r: Row) =>
        r.status === "PENDING" || r.status === "RETRY";
      setRows(tab === "needs" ? mapped.filter(needRow) : mapped);
    } catch {
      setRows([]);
      toast.error("Không thể tải danh sách giao dịch.");
    } finally {
      setLoading(false);
    }
  }, [
    fromDate,
    toDate,
    typeFilter,
    statusFilter,
    shopId,
    pageIndex,
    pageSize,
    tab,
    shopOptions,
  ]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleConfirm = async (id: string) => {
    try {
      await updateWalletTransactionStatus(id, WalletTransactionStatus.Success);
      toast.success("Xác nhận giao dịch thành công");
      fetchData();
    } catch {
      toast.error("Xác nhận giao dịch thất bại");
    }
  };

  const displayNameFromId = async (idLike?: string) => {
    if (!idLike) return undefined;
    const looksLikeId = /^[0-9a-f-]{20,}$/i.test(idLike);
    if (!looksLikeId) return idLike;
    try {
      const u: UserDTO = await getUserById(idLike);
      return u?.fullname || u?.username || idLike;
    } catch {
      return idLike;
    }
  };

  const handleDetails = async (tx: Row) => {
    setDetailsTx(tx);
    setDetailsOpen(true);
    setDetailsLoading(true);
    try {
      const [shopResp, ownerResp, walletResp] = await Promise.all([
        tx.shopId
          ? (getshopById(tx.shopId) as Promise<ShopByIdResponse>)
          : Promise.resolve(undefined),
        tx.shopId
          ? (getUserByShopId(tx.shopId) as Promise<UserByShopIdResponse>)
          : Promise.resolve([] as UserDTO[]),
        tx.shopId
          ? (getWalletShopId(tx.shopId) as Promise<WalletShopResponse>)
          : Promise.resolve(undefined),
      ]);

      const shopName = extractShopName(shopResp);

      const seller = pickSeller(ownerResp);
      const sellerDetail: UserDTO = seller.id
        ? await getUserById(seller.id)
        : {};

      const ownerName = sellerDetail.fullname;
      const ownerPhone = sellerDetail.phoneNumber;
      const ownerEmail = sellerDetail.email;

      const w = walletResp;
      const bankName =
        (isNonEmptyString(
          (w as { data?: { bankName?: string } })?.data?.bankName
        )
          ? (w as { data?: { bankName?: string } })?.data?.bankName
          : undefined) ??
        (isNonEmptyString((w as { bankName?: string })?.bankName)
          ? (w as { bankName?: string })?.bankName
          : undefined);

      const bankNumber =
        (isNonEmptyString(
          (w as { data?: { bankAccountNumber?: string } })?.data
            ?.bankAccountNumber
        )
          ? (w as { data?: { bankAccountNumber?: string } })?.data
              ?.bankAccountNumber
          : undefined) ??
        (isNonEmptyString(
          (w as { bankAccountNumber?: string })?.bankAccountNumber
        )
          ? (w as { bankAccountNumber?: string })?.bankAccountNumber
          : undefined);

      const [createdByName, updatedByName] = await Promise.all([
        displayNameFromId(tx.createdBy),
        displayNameFromId(tx.updatedBy),
      ]);

      setDetailsTx((prev) =>
        prev
          ? {
              ...prev,
              shopName: shopName ?? prev.shopName,
              ownerName: ownerName ?? prev.ownerName,
              ownerPhone: ownerPhone ?? prev.ownerPhone,
              ownerEmail: ownerEmail ?? prev.ownerEmail,
              ownerId: seller.id ?? prev.ownerId,
              createdBy: createdByName ?? prev.createdBy,
              updatedBy: updatedByName ?? prev.updatedBy,
              bankName: bankName ?? prev.bankName,
              bankNumber: bankNumber ?? prev.bankNumber,
            }
          : prev
      );
    } catch {
      // ignore
    } finally {
      setDetailsLoading(false);
    }
  };

  const onResetFilters = () => {
    setFromDate("");
    setToDate("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
    setPageIndex(1);
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header + Filters */}
      <div className="bg-white sticky top-0 z-10 h-fit w-full py-4 px-8 shadow flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold mb-1">Quản lý giao dịch</h2>
          <p className="text-black/70">Quản lý toàn bộ giao dịch của sàn</p>
        </div>
        <Filters
          fromDate={fromDate}
          toDate={toDate}
          setFromDate={setFromDate}
          setToDate={setToDate}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          shopId={shopId}
          setShopId={(v) => {
            setShopId(v);
            setPageIndex(1);
          }}
          shopOptions={shopOptions}
          onReset={onResetFilters}
          onApply={fetchData}
          disabledStatus={tab === "needs"}
          loading={loading}
        />
      </div>

      {/* Tabs */}
      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as typeof tab);
          setPageIndex(1);
        }}
      >
        <TabsList className="rounded-none bg-gray-200 border">
          <TabsTrigger
            value="all"
            className="rounded-none p-3 data-[state=active]:bg-[#B0F847]/50 data-[state=active]:text-black"
          >
            Tất cả
          </TabsTrigger>
          <TabsTrigger
            value="needs"
            className="rounded-none p-3 data-[state=active]:bg-[#B0F847]/50 data-[state=active]:text-black"
          >
            Cần xử lý
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <AdminTxTable<Row>
            rows={rows}
            loading={loading}
            onConfirm={handleConfirm}
            onDetails={handleDetails}
            showConfirm={false}
            renderType={(t) => {
              const { label, icon: Icon, tone } = txTypeVN(t);
              return (
                <div
                  className={`inline-flex items-center gap-2 px-2 py-1 rounded ${tone}`}
                >
                  <Icon size={16} /> <span className="text-sm">{label}</span>
                </div>
              );
            }}
            renderStatus={(s) => <StatusBadge status={s as TxStatus} />}
            renderDate={(c, p) => <DateCell createdAt={c} processedAt={p} />}
            renderAmount={(t, n) => {
              const { label } = txTypeVN(t);
              const isIn = label === "Nạp tiền" || label === "Hoa hồng";
              return (
                <span
                  className={`${
                    isIn ? "text-green-600" : "text-red-600"
                  } font-medium`}
                >
                  {isIn ? "+" : "-"}
                  {formatVND(Math.abs(n))}
                </span>
              );
            }}
          />
        </TabsContent>

        <TabsContent value="needs">
          <AdminTxTable<Row>
            rows={rows}
            loading={loading}
            onConfirm={handleConfirm}
            onDetails={handleDetails}
            showConfirm={true}
            renderType={(t) => {
              const { label, icon: Icon, tone } = txTypeVN(t);
              return (
                <div
                  className={`inline-flex items-center gap-2 px-2 py-1 rounded ${tone}`}
                >
                  <Icon size={16} /> <span className="text-sm">{label}</span>
                </div>
              );
            }}
            renderStatus={(s) => <StatusBadge status={s as TxStatus} />}
            renderDate={(c, p) => <DateCell createdAt={c} processedAt={p} />}
            renderAmount={(t, n) => {
              const { label } = txTypeVN(t);
              const isIn = label === "Nạp tiền" || label === "Hoa hồng";
              return (
                <span
                  className={`${
                    isIn ? "text-green-600" : "text-red-600"
                  } font-medium`}
                >
                  {isIn ? "+" : "-"}
                  {formatVND(Math.abs(n))}
                </span>
              );
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Pagination đơn giản */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
          disabled={loading || pageIndex <= 1}
        >
          Trước
        </Button>
        <span>
          Trang {pageIndex}/{totalPage}
        </span>
        <Button
          variant="outline"
          onClick={() => setPageIndex((p) => Math.min(totalPage, p + 1))}
          disabled={loading || pageIndex >= totalPage}
        >
          Sau
        </Button>
      </div>

      {/* Details Modal */}
      <DetailsModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        loading={detailsLoading}
        tx={detailsTx}
        renderStatus={(s) => <StatusBadge status={s as TxStatus} />}
        formatCurrency={formatVND}
        formatDateTime={formatDT}
        Icons={{ Store, User2, Mail, Phone, Landmark, Wallet, IdCard }}
      />
    </div>
  );
}
