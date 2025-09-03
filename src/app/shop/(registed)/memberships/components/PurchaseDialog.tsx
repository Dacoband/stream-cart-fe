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
import { Card, CardContent } from "@/components/ui/card";
import {
  Crown,
  Clock,
  Users,
  Video,
  Package,
  RotateCw,
  Sparkles,
} from "lucide-react";
import type { Membership } from "@/types/membership/membership";
import { toast } from "sonner";
import { purchaseShopMembership } from "@/services/api/membership/shopMembership";

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
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("Không thể đăng ký gói thành viên. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!membership || !mounted) return null;

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

        <div className="space-y-4">
          {/* Card gói: nền trắng, nhấn bằng stripe emerald */}
          <Card className="border rounded-xl border-gray-200">
            <div className="h-[3px] w-full rounded-t-xl bg-emerald-500" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  {membership.name}
                </h3>
                <Badge className="bg-emerald-600 text-white border border-emerald-600">
                  {membership.type}
                </Badge>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {membership.description}
              </p>

              <div className="text-center mb-4">
                <div className="text-3xl font-extrabold text-emerald-700">
                  {formatCurrency(membership.price)}
                </div>
                <div className="text-sm text-gray-600">
                  / {membership.duration} ngày
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  Thời hạn: {membership.duration} ngày
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  Tối đa {membership.maxModerator} nhân viên
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-gray-500" />
                  Tối đa {membership.maxLivestream} livestream
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  Hoa hồng: {membership.commission}%
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quyền lợi: trung tính */}
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              Quyền lợi khi đăng ký
            </h4>
            <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside">
              <li>Tăng giới hạn sản phẩm và livestream</li>
              <li>Hỗ trợ nhiều nhân viên hơn</li>
              <li>Tỷ lệ hoa hồng tốt hơn</li>
            </ul>
          </div>
        </div>
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
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white"
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
