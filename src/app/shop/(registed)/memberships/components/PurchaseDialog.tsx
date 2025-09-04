"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Video, Package, RotateCw, List } from "lucide-react";
import type { Membership } from "@/types/membership/membership";
import { toast } from "sonner";
import { purchaseShopMembership } from "@/services/api/membership/shopMembership";
import { AxiosError } from "axios";

const formatCurrency = (v?: number) =>
  typeof v === "number" ? v.toLocaleString("vi-VN") + "đ" : "-";

export default function PurchaseDialog({
  membership,
  open,
  onOpenChange,
}: {
  membership: Membership | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => setMounted(true), []);

  const handlePurchase = async () => {
    if (!membership) return;
    try {
      setLoading(true);
      await purchaseShopMembership(membership.membershipId);
      toast.success(`Đăng ký thành công gói ${membership.name}!`);
      onOpenChange(false);
    } catch (error: unknown) {
      console.error("Start livefailed:", error);
      const err = error as AxiosError<{ message?: string; errors?: string[] }>;
      const message =
        err?.response?.data?.errors?.[0] ||
        err?.response?.data?.message ||
        "Truy cập live thất bại!";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!membership || !mounted) return null;

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
        kind,
      } as const;
    }
    return {
      header: "bg-gradient-to-r from-amber-500 to-yellow-500",
      button: "bg-gradient-to-r from-amber-500 to-yellow-500",
      badge: "bg-white text-amber-500",
      label: "Gói gia hạn",
      text: "text-amber-500",
      kind,
    } as const;
  };
  const style = getTypeStyle(membership.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-emerald-600" />
            Xác nhận đăng ký gói thành viên
          </DialogTitle>
          <DialogDescription>
            Vui lòng xem lại thông tin gói thành viên trước khi đăng ký
          </DialogDescription>
        </DialogHeader>

        {/* Card: match memberships page styling */}
        <Card className="border rounded-xl gap-0 border-gray-200 p-0 overflow-hidden">
          <CardHeader
            className={`py-1.5 px-5 ${style.header} rounded-t-sm text-white`}
          >
            <div className="flex items-center justify-between gap-3">
              <CardTitle
                className="text-xl line-clamp-1"
                title={membership.name}
              >
                {membership.name}
              </CardTitle>
              <Badge className={`text-white border ${style.badge}`}>
                {style.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex flex-col gap-4">
            {/* Price */}
            <div className="text-center flex space-y-1 mx-auto items-end">
              <div className={`text-2xl font-extrabold ${style.badge}`}>
                {formatCurrency(membership.price)}
              </div>
            </div>

            {/* Features */}
            <div className="text-sm space-y-2">
              {style.kind === "new" ? (
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-gray-500" />
                  Tổng thời gian live trong 1 tháng :{" "}
                  {membership.maxLivestream ?? "—"} phút
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-gray-500" />
                  Tổng thời gian live bổ sung :{" "}
                  {membership.maxLivestream ?? "—"} phút
                </div>
              )}
              {style.kind === "new" && (
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  Hoa hồng: {membership.commission ?? "—"}%
                </div>
              )}
              <div className="flex items-center gap-2">
                <List className="h-4 w-4 text-gray-500" /> Mô tả:{" "}
                {membership.description}
              </div>
            </div>
          </CardContent>
          <CardContent className="bg-blue-50 border-blue-300 text-blue-600 py-2 text-sm mb-5 border mx-5">
            <div className="font-medium mb-1">Lưu ý:</div>
            <div>- Gói chính sẽ tự gia hạn theo tháng.</div>

            <div>- Gói gia hạn sẽ được cộng vào thời gian live.</div>
          </CardContent>
        </Card>

        <DialogFooter className="flex w-full justify-end flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Hủy
          </Button>

          <Button
            onClick={handlePurchase}
            disabled={loading}
            className={`w-full sm:w-auto ${style.button} text-white`}
          >
            {loading ? (
              <>
                <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Crown className="h-4 w-4 mr-2" /> Đăng ký ngay
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
