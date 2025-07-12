"use client";

import { useEffect } from "react";
import { Dialog, DialogPortal } from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";

interface AutoCloseDialogProps {
  open: boolean;
  onClose: () => void;
  duration?: number;
  message?: string;
}

export default function AutoCloseDialog({
  open,
  onClose,
  duration = 1200,
  message = "Đã thêm vào giỏ hàng thành công!",
}: AutoCloseDialogProps) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogPortal>
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="
              bg-black/80 text-white 
              px-8 py-6 
              rounded-lg shadow-lg 
              flex flex-col items-center justify-center gap-4 
              max-w-xs text-center
              animate-fade-in
            "
          >
            <CheckCircle2 className="text-[#B0F847] w-10 h-10" />
            <p className="text-base font-semibold">{message}</p>
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
