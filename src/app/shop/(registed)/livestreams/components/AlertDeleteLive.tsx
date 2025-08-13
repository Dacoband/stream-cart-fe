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

import { Livestream } from "@/types/livestream/livestream";

interface AlertDeleteProps {
  open: boolean;
  livestream: Livestream | null;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function AlertDelete({
  open,
  livestream,
  loading,
  onCancel,
  onConfirm,
}: AlertDeleteProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa livestream{" "}
            <span className="font-semibold">
              {livestream?.title || "đang chọn"}
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
