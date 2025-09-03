"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Crown,
  Clock,
  Users,
  Video,
  Package,
  Filter,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { filterShopMembership } from "@/services/api/membership/shopMembership";
import {
  DetailShopMembershipDTO,
  FilterShopMembership,
} from "@/types/membership/shopMembership";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";

/* ===========================
   Constants & helpers
=========================== */
const STATUS = {
  Ongoing: "Ongoing", // Đang hoạt động
  Waiting: "Waiting", // Chờ hoạt động
  Cancelled: "Cancelled", // Đã hủy
  Overdue: "Overdue", // Hết hạn
} as const;

const VI_LABEL: Record<string, string> = {
  [STATUS.Ongoing]: "Đang hoạt động",
  [STATUS.Waiting]: "Chờ hoạt động",
  [STATUS.Cancelled]: "Đã hủy",
  [STATUS.Overdue]: "Hết hạn",
};

const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

const statusAccent = (s: string) => {
  switch (s) {
    case STATUS.Ongoing:
      return "bg-emerald-500";
    case STATUS.Waiting:
      return "bg-amber-500";
    case STATUS.Overdue:
      return "bg-rose-500";
    case STATUS.Cancelled:
      return "bg-slate-400";
    default:
      return "bg-gray-300";
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case STATUS.Ongoing:
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200">
          {VI_LABEL[status]}
        </Badge>
      );
    case STATUS.Waiting:
      return (
        <Badge className="bg-amber-100 text-amber-800 border border-amber-200">
          {VI_LABEL[status]}
        </Badge>
      );
    case STATUS.Overdue:
      return (
        <Badge className="bg-rose-100 text-rose-800 border border-rose-200">
          {VI_LABEL[status]}
        </Badge>
      );
    case STATUS.Cancelled:
      return (
        <Badge className="bg-slate-100 text-slate-700 border border-slate-200">
          {VI_LABEL[status]}
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case STATUS.Ongoing:
      return <CheckCircle className="h-4 w-4 text-emerald-600" />;
    case STATUS.Waiting:
      return <Clock className="h-4 w-4 text-amber-600" />;
    case STATUS.Overdue:
      return <XCircle className="h-4 w-4 text-rose-600" />;
    case STATUS.Cancelled:
      return <XCircle className="h-4 w-4 text-slate-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-600" />;
  }
};

/* ===========================
   Page
=========================== */
export default function MyMembershipPage() {
  const { user, loading: authLoading = false } = useAuth();

  // UI/state
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Data
  const [items, setItems] = useState<DetailShopMembershipDTO[]>([]);

  // Filters
  const [activeTab, setActiveTab] = useState<string>(STATUS.Ongoing); // trạng thái = tab
  const [fromDate, setFromDate] = useState(""); // yyyy-mm-dd
  const [toDate, setToDate] = useState(""); // yyyy-mm-dd

  // tránh fetch lặp (StrictMode / params trùng)
  const lastParamsKey = useRef<string>("");

  useEffect(() => setMounted(true), []);

  const fetchMemberships = useCallback(async () => {
    if (!user?.shopId) return;

    const payload: FilterShopMembership = {
      shopId: user.shopId,
      pageIndex: 1,
      pageSize: 50,
      status: activeTab,
      startDate: fromDate ? new Date(fromDate) : undefined,
      endDate: toDate ? new Date(toDate) : undefined,
    };

    const paramsKey = JSON.stringify({
      shopId: payload.shopId,
      status: payload.status,
      start: payload.startDate?.toISOString() ?? null,
      end: payload.endDate?.toISOString() ?? null,
    });
    if (lastParamsKey.current === paramsKey) {
      // bỏ qua fetch trùng
      return;
    }
    lastParamsKey.current = paramsKey;

    try {
      setLoading(true);
      const res = await filterShopMembership(payload);
      const normalized: DetailShopMembershipDTO[] =
        res?.detailShopMembership ?? res?.items ?? res?.data ?? [];
      setItems(Array.isArray(normalized) ? normalized : []);
      if (!normalized?.length) {
        // không toast ở đây để tránh phiền, chỉ log
        // console.debug('API ok, nhưng không có dữ liệu.')
      }
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải danh sách gói thành viên");
    } finally {
      setLoading(false);
    }
  }, [user?.shopId, activeTab, fromDate, toDate]);

  // fetch khi auth xong + có shopId
  useEffect(() => {
    if (!mounted || authLoading || !user?.shopId) return;
    fetchMemberships();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, authLoading, user?.shopId]);

  // fetch khi đổi tab
  useEffect(() => {
    if (!mounted || authLoading || !user?.shopId) return;
    fetchMemberships();
  }, [activeTab, mounted, authLoading, user?.shopId, fetchMemberships]);

  // đếm (lưu ý: vì fetch theo tab nên chỉ có số của tab hiện tại)
  // const counts = useMemo(
  //   () => ({
  //     Ongoing: activeTab === STATUS.Ongoing ? items.length : 0,
  //     Waiting: activeTab === STATUS.Waiting ? items.length : 0,
  //     Overdue: activeTab === STATUS.Overdue ? items.length : 0,
  //     Cancelled: activeTab === STATUS.Cancelled ? items.length : 0,
  //   }),
  //   [activeTab, items.length]
  // )

  // Hủy gói (Ongoing/Waiting)
  const handleCancel = async (m: DetailShopMembershipDTO) => {
    const ok = window.confirm(`Xác nhận hủy gói #${m.id}?`);
    if (!ok) return;
    try {
      // TODO: call API cancel thật
      toast.success(`Đã hủy gói #${m.id}`);
      setItems((prev) =>
        prev.map((x) =>
          x.id === m.id ? { ...x, status: STATUS.Cancelled } : x
        )
      );
    } catch {
      toast.error("Hủy gói thất bại. Vui lòng thử lại.");
    }
  };

  const renderGrid = (list: DetailShopMembershipDTO[]) => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (!list.length) {
      return (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không có gói trong mục này
            </h3>
            <p className="text-gray-500">Hãy điều chỉnh bộ lọc</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((m) => (
          <Card
            key={m.id}
            className="border border-gray-200 flex h-full flex-col"
          >
            <div
              className={`h-[3px] w-full rounded-t-lg ${statusAccent(
                m.status
              )}`}
            />
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <StatusIcon status={m.status} />
                  Gói thành viên
                </CardTitle>
                <StatusBadge status={m.status} />
              </div>
            </CardHeader>

            <CardContent className="flex h-full flex-col gap-4 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Ngày bắt đầu</p>
                  <p className="font-medium">{fmtDate(m.startDate)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Ngày kết thúc</p>
                  <p className="font-medium">{fmtDate(m.endDate)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-gray-500" />
                  <span>Còn lại: {m.remainingLivestream} livestream</span>
                </div>
                {!!m.maxProduct && (
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span>Tối đa: {m.maxProduct} nhân viên</span>
                  </div>
                )}
                {!!m.commission && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>Hoa hồng: {m.commission}%</span>
                  </div>
                )}
              </div>

              {(m.status === STATUS.Ongoing || m.status === STATUS.Waiting) && (
                <div className="mt-auto flex justify-end">
                  <Button
                    onClick={() => handleCancel(m)}
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-500 text-white shadow-sm"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Hủy gói
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (!mounted) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Crown className="h-8 w-8 text-emerald-600" />
            Gói thành viên của tôi
          </h1>
          <p className="text-gray-600 mt-2">
            Quản lý và theo dõi các gói thành viên của cửa hàng
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-emerald-600" />
            Lọc theo ngày
          </CardTitle>
          <CardDescription>Trạng thái chọn ở Tab bên dưới.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="grid grid-cols-2 gap-2 md:col-span-2">
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                aria-label="Từ ngày"
              />
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                aria-label="Đến ngày"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setFromDate("");
                setToDate("");
                lastParamsKey.current = ""; // clear để lần fetch sau không bị block
              }}
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              Đặt lại
            </Button>
            <Button
              onClick={() => {
                lastParamsKey.current = ""; // thay đổi filter -> ép fetch
                fetchMemberships();
              }}
              disabled={loading || authLoading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Áp dụng
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs theo STATUS */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v);
          lastParamsKey.current = ""; // đổi tab -> cho phép fetch
        }}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger
            value={STATUS.Ongoing}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            {VI_LABEL[STATUS.Ongoing]}
          </TabsTrigger>
          <TabsTrigger
            value={STATUS.Waiting}
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            {VI_LABEL[STATUS.Waiting]}
          </TabsTrigger>
          <TabsTrigger
            value={STATUS.Overdue}
            className="flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            {VI_LABEL[STATUS.Overdue]}
          </TabsTrigger>
          <TabsTrigger
            value={STATUS.Cancelled}
            className="flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            {VI_LABEL[STATUS.Cancelled]}
          </TabsTrigger>
        </TabsList>

        {/* Nội dung mỗi tab dùng cùng 1 renderer vì data đã lọc theo API bằng status */}
        {[STATUS.Ongoing, STATUS.Waiting, STATUS.Overdue, STATUS.Cancelled].map(
          (key) => (
            <TabsContent key={key} value={key} className="space-y-4">
              {renderGrid(items)}
            </TabsContent>
          )
        )}
      </Tabs>
    </div>
  );
}
