"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  updateStockProductById,
  getProductDetailById,
} from "@/services/api/product/product";
import { updateStockProductVariant } from "@/services/api/product/productVarriant";
import type { Product, ProductDetail, Variant } from "@/types/product/product";

type Props = {
  open: boolean;
  product: Product | null | undefined;
  detail?: ProductDetail;
  onClose: () => void;
  onUpdated: () => void;
};

const formatVariantName = (v: Variant) =>
  Object.entries(v.attributeValues || {})
    .map(([k, val]) => `${k}: ${val}`)
    .join(" | ");

export default function DialogUpdateStock({
  open,
  product,
  detail,
  onClose,
  onUpdated,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [newQuantity, setNewQuantity] = useState<string>(""); // string
  const [variantStocks, setVariantStocks] = useState<Record<string, string>>(
    {}
  );
  const [detailState, setDetailState] = useState<ProductDetail | undefined>(
    detail
  );

  const hasVariant = !!product?.hasVariant;

  useEffect(() => {
    setNewQuantity(product?.stockQuantity?.toString() ?? "");
    setVariantStocks({});
    setDetailState(detail);
  }, [open, product?.id, product?.stockQuantity, detail]);

  // fetch detail nếu có variant
  useEffect(() => {
    const fetchDetail = async () => {
      if (!open || !product?.id || !hasVariant) return;
      if (detail) return;
      try {
        const res = await getProductDetailById(product.id);
        setDetailState(res);
      } catch (e) {
        console.error("Failed to fetch product detail for variants", e);
      }
    };
    fetchDetail();
  }, [open, product?.id, hasVariant, detail]);

  // khởi tạo variant stock
  useEffect(() => {
    if (!hasVariant || !detailState?.variants) return;
    const init: Record<string, string> = {};
    detailState.variants.forEach((v) => {
      if (v.variantId) init[v.variantId] = v.stock?.toString() ?? "";
    });
    setVariantStocks(init);
  }, [hasVariant, detailState?.variants]);

  const canSubmit = useMemo(() => {
    if (!product) return false;

    if (!hasVariant) {
      const current = product.stockQuantity ?? 0;
      const parsed = parseInt(newQuantity, 10);
      return (
        !!newQuantity.trim() && !Number.isNaN(parsed) && parsed !== current
      );
    }

    if (!detailState?.variants) return false;
    return detailState.variants.some((v) => {
      if (!v.variantId) return false;
      const val = variantStocks[v.variantId];
      if (!val?.trim()) return false;
      const parsed = parseInt(val, 10);
      return !Number.isNaN(parsed) && parsed !== v.stock;
    });
  }, [product, hasVariant, newQuantity, detailState?.variants, variantStocks]);

  const onSave = async () => {
    if (!product) return;
    try {
      setLoading(true);

      if (!hasVariant) {
        if (!newQuantity.trim()) {
          toast.error("Vui lòng nhập số lượng");
          return;
        }
        const parsed = parseInt(newQuantity, 10);
        if (Number.isNaN(parsed) || parsed < 0) {
          toast.error("Số lượng không hợp lệ");
          return;
        }

        const delta = parsed - (product.stockQuantity ?? 0);
        if (delta !== 0) {
          await updateStockProductById(product.id, { quantityChange: delta });
        }
        toast.success("Cập nhật kho sản phẩm thành công");
      } else {
        const tasks: Promise<void>[] = [];

        (detailState?.variants || []).forEach((v) => {
          if (!v.variantId) return;
          const val = variantStocks[v.variantId];
          if (!val?.trim()) return;

          const parsed = parseInt(val, 10);
          if (Number.isNaN(parsed) || parsed < 0) return;

          if (parsed !== v.stock) {
            tasks.push(
              updateStockProductVariant(v.variantId, { quantity: parsed }).then(
                () => {}
              )
            );
          }
        });

        await Promise.all(tasks);
        toast.success("Cập nhật kho phân loại thành công");
      }

      onUpdated();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("Cập nhật kho thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !loading && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cập nhật kho</DialogTitle>
          <DialogDescription>
            {hasVariant
              ? "Nhập số lượng tồn kho cho từng phân loại."
              : "Nhập số lượng tồn kho mới cho sản phẩm (>= 0)."}
          </DialogDescription>
        </DialogHeader>

        {product && (
          <div className="flex items-center gap-4 p-2 rounded bg-muted/30">
            <Image
              src={product.primaryImageUrl || "/assets/emptydata.png"}
              alt={product.productName}
              width={64}
              height={64}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="min-w-0">
              <div className="font-semibold truncate">
                {product.productName}
              </div>
              <div className="text-sm text-muted-foreground">
                SKU: {product.sku}
              </div>
            </div>
            {!hasVariant && (
              <div className="ml-auto text-sm">
                Tồn hiện tại: {product.stockQuantity}
              </div>
            )}
          </div>
        )}

        {!hasVariant ? (
          <div className="space-y-2">
            <label className="text-sm font-medium">Số lượng tồn kho mới</label>
            <Input
              type="text"
              inputMode="numeric"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              placeholder="Nhập số lượng tồn kho mới"
            />
            <div className="text-xs text-muted-foreground">
              Giá trị phải là số nguyên ≥ 0
            </div>
          </div>
        ) : (
          <div className="max-h-[50vh] overflow-y-auto space-y-3">
            {(detailState?.variants || []).map((v) => (
              <div
                key={v.variantId || Math.random()}
                className="flex items-center gap-3 p-2 rounded border"
              >
                <Image
                  src={
                    v.variantImage?.url ||
                    product?.primaryImageUrl ||
                    "/assets/emptydata.png"
                  }
                  alt={
                    formatVariantName(v) || product?.productName || "variant"
                  }
                  width={48}
                  height={48}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {formatVariantName(v) || product?.productName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Tồn hiện tại: {v.stock}
                  </div>
                </div>
                {v.variantId ? (
                  <Input
                    type="text"
                    inputMode="numeric"
                    className="w-28"
                    value={variantStocks[v.variantId] ?? ""}
                    onChange={(e) =>
                      setVariantStocks((prev) => ({
                        ...prev,
                        [v.variantId as string]: e.target.value,
                      }))
                    }
                  />
                ) : (
                  <div className="text-xs text-muted-foreground">
                    Không có mã phân loại
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="cursor-pointer"
          >
            Hủy
          </Button>
          <Button
            onClick={onSave}
            disabled={!canSubmit || loading}
            className={cn("cursor-pointer", loading && "opacity-80")}
          >
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
