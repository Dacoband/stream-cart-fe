"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImagePlus, RotateCcw, Loader2, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import PriceTag from "@/components/common/PriceTag";

import { getOrderProductByOrderId } from "@/services/api/order/ordersItem";
import { getProductDetailById } from "@/services/api/product/product";
import { getListBank } from "@/services/api/listbank/listbank";
import { createRefundRequest } from "@/services/api/refund/refund";
import { uploadImage } from "@/services/api/uploadImage";

import type { OrderItemResponse } from "@/types/order/order";
import type { Bank } from "@/types/listbank/listbank";
import { Variant } from "@/types/product/product";
import { AxiosError } from "axios";

type VariantAttrs = Record<string, string>;
type Selected = { selected: boolean; reason: string; imageUrl?: string };

type Props = {
  open: boolean;
  onClose: () => void;
  orderId: string;
};

const isEmpty = (s?: string | null) => !s || s.trim() === "";

export default function RefundRequestModal({ open, onClose, orderId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [items, setItems] = useState<OrderItemResponse[]>([]);
  const [variantMap, setVariantMap] = useState<Record<string, VariantAttrs>>(
    {}
  );
  const [sel, setSel] = useState<Record<string, Selected>>({});
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankCode, setBankCode] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        const payload = await getOrderProductByOrderId(orderId);
        let orderItems: OrderItemResponse[] = [];
        if (Array.isArray(payload)) orderItems = payload;
        else if (payload?.items) orderItems = payload.items;
        else if (payload?.data?.items) orderItems = payload.data.items;
        if (cancelled) return;
        setItems(orderItems);

        const init: Record<string, Selected> = {};
        for (const it of orderItems)
          init[it.id] = { selected: false, reason: "", imageUrl: "" };
        setSel(init);

        const vmap: Record<string, VariantAttrs> = {};
        for (const it of orderItems) {
          if (it.productId && it.variantId) {
            try {
              const detail = await getProductDetailById(it.productId);
              const v = detail?.variants?.find(
                (vv: Variant) => vv.variantId === it.variantId
              );
              if (v?.attributeValues) vmap[it.id] = v.attributeValues;
            } catch {}
          }
        }
        if (!cancelled) setVariantMap(vmap);

        try {
          const list = await getListBank();
          if (!cancelled) setBanks(list || []);
        } catch {}
      } catch (e) {
        console.error(e);
        toast.error("Không thể tải sản phẩm của đơn hàng");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [open, orderId]);

  const toggle = (id: string, checked: boolean) =>
    setSel((p) => ({ ...p, [id]: { ...p[id], selected: checked } }));
  const changeReason = (id: string, reason: string) =>
    setSel((p) => ({ ...p, [id]: { ...p[id], reason } }));
  const changeImage = (id: string, imageUrl: string) =>
    setSel((p) => ({ ...p, [id]: { ...p[id], imageUrl } }));

  const handleUpload = async (id: string, file?: File | null) => {
    if (!file) return;
    try {
      setUploading((u) => ({ ...u, [id]: true }));
      const res = await uploadImage(file);
      const url =
        res?.data?.url ??
        res?.data?.imageUrl ??
        res?.url ??
        res?.path ??
        res?.imageUrl ??
        (typeof res === "string" ? res : "");

      if (!url) {
        throw new Error("Không nhận được URL ảnh từ server");
      }
      changeImage(id, url);
      toast.success("Tải ảnh thành công");
    } catch (error: unknown) {
      console.error("Start livefailed:", error);
      const err = error as AxiosError<{ message?: string; errors?: string[] }>;
      const message =
        err?.response?.data?.errors?.[0] ||
        err?.response?.data?.message ||
        "Tải ảnh thất bại!";

      toast.error(message);
    } finally {
      setUploading((u) => ({ ...u, [id]: false }));
    }
  };

  const selectedCount = useMemo(
    () => Object.values(sel).filter((x) => x?.selected).length,
    [sel]
  );

  const onSubmit = async () => {
    const chosen = Object.entries(sel).filter(([, v]) => v.selected);
    if (chosen.length === 0)
      return toast.error("Vui lòng chọn ít nhất 1 sản phẩm");

    for (const [id, v] of chosen) {
      if (isEmpty(v.reason)) {
        const oi = items.find((x) => x.id === id);
        return toast.error(`Nhập lý do cho "${oi?.productName ?? "sản phẩm"}"`);
      }
    }

    setSubmitting(true);
    try {
      await createRefundRequest({
        orderId,
        refundItems: chosen.map(([orderItemId, v]) => ({
          orderItemId,
          reason: v.reason,
          imageUrl: isEmpty(v.imageUrl) ? undefined : v.imageUrl,
          bankNumber: bankAccount,
          bankName: bankCode,
        })),
        bankName: bankCode,
        bankNumber: bankAccount,
      });

      toast.success("Gửi yêu cầu hoàn hàng thành công");
      onClose();
      router.push("/customer/refund");
    } catch (error: unknown) {
      console.error("Start livefailed:", error);
      const err = error as AxiosError<{ message?: string; errors?: string[] }>;
      const message =
        err?.response?.data?.errors?.[0] ||
        err?.response?.data?.message ||
        "Yêu cầu hoàn đơn thất bại!";

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : void 0)}>
      <DialogContent
        className="!w-[96vw] sm:max-w-[1120px] max-w-[1120px] p-0 overflow-hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 pt-5 pb-3 border-b bg-white">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <RotateCcw className="w-5 h-5 text-lime-600" />
            Tạo yêu cầu hoàn hàng
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Chọn sản phẩm cần hoàn, nhập lý do và (tuỳ chọn) đính kèm ảnh minh
            chứng.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4">
          <div className="border rounded-md overflow-hidden">
            {/* Header: 1 | 8 | 3 | 2 | 6 */}
            <div className="grid grid-cols-20 bg-[#B0F847]/50 text-sm font-medium text-gray-700 px-5 py-2">
              <div className="col-span-1"></div>
              <div className="col-span-8">Sản phẩm</div>
              <div className="col-span-3 text-left">Đơn giá</div>

              <div className="col-span-8">Lý do & Minh chứng</div>
            </div>

            <ScrollArea className="max-h-[65vh]">
              {loading ? (
                <div className="p-4 space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : items.length === 0 ? (
                <div className="p-6 text-gray-500">
                  Không có sản phẩm trong đơn
                </div>
              ) : (
                items.map((it) => {
                  const vattrs = variantMap[it.id];
                  const vText = vattrs
                    ? Object.entries(vattrs)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" • ")
                    : "";
                  const st = sel[it.id] || {
                    selected: false,
                    reason: "",
                    imageUrl: "",
                  };

                  return (
                    <div
                      key={it.id}
                      className="grid grid-cols-20 gap-3 px-5 py-4 border-t items-start"
                    >
                      <div className="col-span-1 pt-1">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={!!st.selected}
                          onChange={(e) => toggle(it.id, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                        />
                      </div>

                      {/* Sản phẩm (tên + SL dưới tên) */}
                      <div className="col-span-8 flex gap-3">
                        <Image
                          src={it.productImageUrl || "/assets/emptydata.png"}
                          alt={it.productName}
                          width={64}
                          height={64}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 break-words leading-snug">
                            {it.productName}
                          </div>
                          {vText && (
                            <div className="text-xs text-gray-600 mt-0.5">
                              {vText}
                            </div>
                          )}
                          {/* số lượng dưới tên */}
                          <div className="text-xs text-gray-500 mt-1">
                            x{it.quantity}
                          </div>
                        </div>
                      </div>

                      <div className="col-span-3 text-left text-sm text-gray-700">
                        <PriceTag value={it.unitPrice} />
                      </div>

                      {/* Lý do & Minh chứng (rộng hơn + preview ảnh) */}
                      <div className="col-span-8 space-y-2">
                        <Textarea
                          placeholder="Nhập lý do hoàn hàng…"
                          value={st.reason}
                          onChange={(e) => changeReason(it.id, e.target.value)}
                          className="min-h-[70px]"
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                        />

                        {/* Khu vực upload + preview */}
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <label
                              className="inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm cursor-pointer hover:bg-gray-50"
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                            >
                              {uploading[it.id] ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Đang tải ảnh…
                                </>
                              ) : (
                                <>
                                  <ImagePlus className="w-4 h-4 text-gray-500" />
                                  Tải ảnh từ máy
                                </>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={!!uploading[it.id]}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  e.currentTarget.value = "";
                                  handleUpload(it.id, file);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                              />
                            </label>

                            {/* Preview + xoá */}
                            {st.imageUrl && (
                              <div className="flex items-center gap-2">
                                {/* thumbnail preview */}
                                <a
                                  href={st.imageUrl}
                                  target="_blank"
                                  className="block w-14 h-14 rounded overflow-hidden border"
                                  onClick={(e) => e.stopPropagation()}
                                  onMouseDown={(e) => e.stopPropagation()}
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={st.imageUrl}
                                    alt="preview"
                                    className="w-full h-full object-cover"
                                  />
                                </a>
                                <button
                                  type="button"
                                  className="p-1 rounded hover:bg-gray-100"
                                  title="Xoá ảnh"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    changeImage(it.id, "");
                                  }}
                                  onMouseDown={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="w-4 h-4 text-gray-500" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </ScrollArea>
          </div>

          {/* Bank info */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <Label className="mb-1 block">Ngân hàng</Label>
              <select
                className="w-full border rounded-md h-10 px-3"
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <option value="">-- Chọn ngân hàng --</option>
                {banks.map((b) => (
                  <option
                    key={b.id ?? b.shortName}
                    value={b.shortName || b.name}
                  >
                    {b.shortName || b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <Label className="mb-1 block">Số tài khoản</Label>
              <Input
                placeholder="Số TK nhận hoàn (không bắt buộc)"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-white">
          <div className="flex-1 text-sm text-gray-600">
            Đã chọn: <span className="font-medium">{selectedCount}</span> sản
            phẩm
          </div>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            onClick={onSubmit}
            disabled={submitting}
            className="bg-lime-600 hover:bg-lime-700 text-white"
          >
            {submitting ? "Đang gửi…" : "Gửi yêu cầu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
