"use client";
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Product } from "@/types/product/product";

interface AlertDeleteProps {
  open: boolean;
  product: Product | null;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function AlertDelete({
  open,
  product,
  loading,
  onCancel,
  onConfirm,
}: AlertDeleteProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận ngừng bán</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn ngừng hoạt động sản phẩm{" "}
            <span className="font-semibold">
              {product?.productName || "đang chọn"}
            </span>{" "}
            không? Thao tác này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading} onClick={onCancel}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-600/90"
          >
            {loading ? "Đang xử lý..." : "Xác nhận"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default AlertDelete;
