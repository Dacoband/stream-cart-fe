"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Crown,
  Video,
  Package,
  ArrowUpAZ,
  ArrowDownAZ,
  List,
} from "lucide-react";
import { filterMembership } from "@/services/api/membership/membership";
import {
  Membership,
  FilterMembershipDTO,
  SortByMembershipEnum,
  SortDirectionEnum,
} from "@/types/membership/membership";
import { toast } from "sonner";
import PurchaseDialog from "./components/PurchaseDialog";

const formatCurrency = (v?: number) =>
  typeof v === "number" ? v.toLocaleString("vi-VN") + "đ" : "-";

const useDebouncedState = <T,>(value: T, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

export default function MembershipsPage() {
  const [mounted, setMounted] = useState(false);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters: name, price range, sort by price only
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedState(searchTerm, 400);
  const [sortDirection, setSortDirection] = useState<SortDirectionEnum>(
    SortDirectionEnum.Asc
  );
  const [priceFrom, setPriceFrom] = useState<string>("");
  const [priceTo, setPriceTo] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  // Dialog
  const [selectedMembership, setSelectedMembership] =
    useState<Membership | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  // Avoid duplicate fetches
  const lastParamsKey = useRef<string>("");

  const fetchMemberships = useCallback(async () => {
    const payload: FilterMembershipDTO = {
      pageIndex: 1,
      pageSize: 12,
      sortBy: SortByMembershipEnum.Price,
      sortDirection,
      ...(typeFilter && { type: typeFilter }),
      ...(priceFrom && { fromPrice: Number(priceFrom) }),
      ...(priceTo && { toPrice: Number(priceTo) }),
    };

    const paramsKey = JSON.stringify({
      q: debouncedSearch || "",
      from: payload.fromPrice ?? null,
      to: payload.toPrice ?? null,
      type: typeFilter || null,
      dir: sortDirection,
    });
    if (lastParamsKey.current === paramsKey) return;
    lastParamsKey.current = paramsKey;

    try {
      setLoading(true);
      const response = await filterMembership(payload);

      setMemberships(response.memberships);
      if (response.memberships.length === 0)
        toast.info("Không tìm thấy gói phù hợp với bộ lọc hiện tại");
    } catch (error) {
      console.error("Error fetching memberships:", error);
      toast.error("Không thể tải danh sách gói thành viên");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, priceFrom, priceTo, sortDirection, typeFilter]);

  useEffect(() => {
    if (mounted) fetchMemberships();
  }, [fetchMemberships, mounted]);

  const clearAll = () => {
    setSearchTerm("");
    setPriceFrom("");
    setPriceTo("");
    setTypeFilter("");
    setSortDirection(SortDirectionEnum.Asc);
    lastParamsKey.current = "";
  };

  const handlePurchase = (m: Membership) => {
    setSelectedMembership(m);
    setPurchaseDialogOpen(true);
  };

  // Helpers by type: New/Main => purple, Renewal => yellow
  const getTypeKind = (type: Membership["type"]) => {
    const s = String(type).trim().toLowerCase();
    if (s === "1" || s === "new" || s === "main") return "new" as const;
    return "renewal" as const;
  };
  const getTypeStyle = (type: Membership["type"]) => {
    const kind = getTypeKind(type);
    if (kind === "new") {
      return {
        header: "bg-gradient-to-r from-purple-500 to-fuchsia-500",
        button: "bg-gradient-to-r from-purple-500 to-fuchsia-500",
        badge: "bg-white text-purple-500",
        label: "Gói chính",
        text: "text-purple-500",
      } as const;
    }
    return {
      header: "bg-gradient-to-r from-amber-500 to-yellow-500",
      button: "bg-gradient-to-r from-amber-500 to-yellow-500",
      badge: "bg-white text-amber-500",
      label: "Gói gia hạn",
      text: "text-amber-500",
    } as const;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gói thành viên</h1>
          <p className="text-gray-600 mt-2">
            Chọn gói thành viên phù hợp với nhu cầu kinh doanh của bạn
          </p>
        </div>
      </div>

      {/* Search & Filters (tối giản màu) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-[var(--color-base-dark)]" />
            Tìm kiếm & Lọc
          </CardTitle>
          <CardDescription>
            Tìm theo tên, lọc theo giá, và sắp xếp theo giá.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search */}
            <div className="relative md:col-span-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Nhập tên gói..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  lastParamsKey.current = "";
                }}
                className="pl-10"
              />
            </div>

            {/* Sort by price (toggle) */}
            <div className="md:col-span-3">
              <Button
                type="button"
                variant="secondary"
                className="w-full border border-[var(--color-base)] text-gray-800"
                onClick={() => {
                  setSortDirection((d) =>
                    d === SortDirectionEnum.Asc
                      ? SortDirectionEnum.Desc
                      : SortDirectionEnum.Asc
                  );
                  lastParamsKey.current = "";
                }}
              >
                {sortDirection === SortDirectionEnum.Asc ? (
                  <>
                    <ArrowUpAZ className="h-4 w-4 mr-2 text-[var(--color-base-dark)]" />
                    Giá: Tăng dần
                  </>
                ) : (
                  <>
                    <ArrowDownAZ className="h-4 w-4 mr-2 text-[var(--color-base-dark)]" />
                    Giá: Giảm dần
                  </>
                )}
              </Button>
            </div>
            <div className="md:col-span-3">
              <Select
                value={typeFilter || "all"}
                onValueChange={(v) => {
                  setTypeFilter(v === "all" ? "" : v);
                  lastParamsKey.current = "";
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Loại gói" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  <SelectItem value="New">Gói chính</SelectItem>
                  <SelectItem value="Renewal">Gói gia hạn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Price range */}
            <div className="md:col-span-3 flex gap-2">
              <Input
                inputMode="numeric"
                placeholder="Giá từ"
                value={priceFrom}
                onChange={(e) => {
                  setPriceFrom(e.target.value.replace(/[^0-9]/g, ""));
                  lastParamsKey.current = "";
                }}
              />
              <Input
                inputMode="numeric"
                placeholder="Giá đến"
                value={priceTo}
                onChange={(e) => {
                  setPriceTo(e.target.value.replace(/[^0-9]/g, ""));
                  lastParamsKey.current = "";
                }}
              />
            </div>
            {/* Type filter */}
          </div>

          {/* Nút reset (chỉ nhá màu hover rất nhẹ) */}
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="hover:bg-[var(--color-base)]/10"
            >
              Đặt lại bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-8 bg-gray-200 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {memberships.map((m) => (
            <Card
              key={m.membershipId}
              className="hover:shadow-lg p-0 transition-shadow border pb-5  border-gray-200 flex h-full flex-col"
            >
              <CardHeader
                className={`py-1.5 px-5 ${getTypeStyle(m.type).header}
 rounded-t-sm text-white`}
              >
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-xl line-clamp-1" title={m.name}>
                    {m.name}
                  </CardTitle>
                  {/* badge viền nhẹ, không đổ màu nền */}
                  <Badge
                    className={`text-white border ${
                      getTypeStyle(m.type).badge
                    }`}
                  >
                    {getTypeStyle(m.type).label}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex h-full flex-col gap-4">
                {/* Giá – giữ chiều cao tối thiểu để các card ngang hàng */}
                <div className="text-center flex space-y-1 mx-auto items-end">
                  <div
                    className={`text-2xl font-extrabold ${
                      getTypeStyle(m.type).badge
                    }`}
                  >
                    {formatCurrency(m.price)}
                  </div>
                  {/* <div className=" text-gray-600">
                    / {m.duration ?? "—"} ngày
                  </div> */}
                </div>

                {/* Features – flex-1 để đẩy nút xuống đáy; icon/text căng giữa */}
                <div className="text-sm flex-1 space-y-1">
                  {/* <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    Thời hạn: {m.duration ?? "—"} ngày
                  </div> */}
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-gray-500" />
                    Thời lượng live : {m.maxLivestream ?? "—"} phút
                  </div>
                  {getTypeKind(m.type) === "new" && (
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      Hoa hồng: {m.commission ?? "—"}%
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <List className="h-4 w-4 text-gray-500" /> Mô tả:{" "}
                    {m.description}
                  </div>
                </div>

                {/* Nút luôn cùng vị trí đáy */}
                <Button
                  onClick={() => handlePurchase(m)}
                  className={`mt-auto w-full ${
                    getTypeStyle(m.type).button
                  } text-white`}
                >
                  <Crown className="h-4 w-4 mr-2" /> Đăng ký ngay
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state – trung tính + nhá màu rất nhẹ */}
      {!loading && memberships.length === 0 && (
        <Card className="border border-gray-200 bg-white">
          <CardContent className="text-center py-12">
            <Crown className="h-12 w-12 text-[var(--color-base-dark)]/80 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy gói thành viên
            </h3>
            <p className="text-gray-700">
              Hãy thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
            <Button className="mt-4" variant="secondary" onClick={clearAll}>
              Đặt lại bộ lọc
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog */}
      <PurchaseDialog
        membership={selectedMembership}
        open={purchaseDialogOpen}
        onOpenChange={setPurchaseDialogOpen}
      />
    </div>
  );
}
