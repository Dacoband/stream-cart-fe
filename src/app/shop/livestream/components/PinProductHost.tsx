"use client";

import React, { useCallback, useRef } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { ImageIcon, Pin } from "lucide-react";
import PriceTag from "@/components/common/PriceTag";
import { Button } from "@/components/ui/button";
import { useLivestreamRealtime } from "@/services/signalr/useLivestreamRealtime";
import { ProductLiveStream } from "@/types/livestream/productLivestream";

type Props = { livestreamId: string };

function PinProductHost({ livestreamId }: Props) {
  const [current, setCurrent] = React.useState<ProductLiveStream | null>(null);
  const loadingRef = useRef(false);

  const realtime = useLivestreamRealtime(livestreamId);

  const refreshPinnedRealtime = useCallback(async () => {
    if (!livestreamId) return;
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      await (realtime.refreshPinned?.() ?? Promise.resolve());
    } finally {
      loadingRef.current = false;
    }
  }, [livestreamId, realtime]);

  // initial realtime refresh
  React.useEffect(() => {
    if (!livestreamId) return;
    refreshPinnedRealtime();
  }, [livestreamId, refreshPinnedRealtime]);

  // when server signals pin status changed, refresh
  React.useEffect(() => {
    if (!livestreamId) return;
    if (!realtime.lastPinChange) return;
    refreshPinnedRealtime();
  }, [realtime.lastPinChange, refreshPinnedRealtime, livestreamId]);

  // map live pinnedProducts push (best-effort)
  React.useEffect(() => {
    if (!livestreamId) return;
    const list = realtime.pinnedProducts as unknown[] | undefined;
    if (!list || list.length === 0) {
      setCurrent(null);
      return;
    }
    const first = (list[0] ?? {}) as Record<string, unknown>;

    const get = (obj: Record<string, unknown>, keys: string[]): unknown => {
      for (const k of keys) if (obj[k] !== undefined) return obj[k];
      return undefined;
    };
    const toStr = (v: unknown) => (v == null ? undefined : String(v));
    const toNum = (v: unknown) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };
    const toBool = (v: unknown) =>
      v === undefined || v === null ? undefined : Boolean(v);

    const mapped: Partial<ProductLiveStream> = {
      id: toStr(get(first, ["id", "Id", "ID"])) || "",
      livestreamId:
        toStr(get(first, ["livestreamId", "LivestreamId"])) || livestreamId,
      productId: toStr(get(first, ["productId", "ProductId"])) || "",
      variantId: toStr(get(first, ["variantId", "VariantId"])) || "",
      isPin: (toBool(get(first, ["isPin", "IsPin"])) ?? true) as boolean,
      price: toNum(get(first, ["price", "Price"])) ?? undefined,
      originalPrice:
        toNum(get(first, ["originalPrice", "OriginalPrice"])) ?? undefined,
      stock: toNum(get(first, ["stock", "Stock"])) ?? undefined,
      productName: toStr(get(first, ["productName", "ProductName"])) || "",
      productImageUrl:
        toStr(
          get(first, [
            "productImageUrl",
            "ProductImageUrl",
            "imageUrl",
            "ImageUrl",
          ])
        ) || undefined,
      variantName:
        toStr(get(first, ["variantName", "VariantName"])) || undefined,
      sku: toStr(get(first, ["sku", "SKU", "Sku"])) || undefined,
    };

    // Accept best-effort; if even name is missing, clear
    if (!mapped.productName) {
      setCurrent(null);
      return;
    }
    setCurrent(mapped as ProductLiveStream);
  }, [realtime.pinnedProducts, livestreamId]);

  if (!current) return null;

  return (
    <Card className="py-2 px-2 absolute top-10 left-4 rounded-none gap-2 border-white w-[350px] bg-white/70">
      <div className="flex justify-between border-b pb-1 font-medium text-gray-600 text-sm">
        Sản phẩm đang ghim
      </div>
      <div className="flex gap-3">
        {current.productImageUrl ? (
          <Image
            height={85}
            width={85}
            src={current.productImageUrl}
            alt={current.productName || "Pinned product"}
            className="rounded object-cover h-[85px] w-[85px]"
          />
        ) : (
          <div className="h-[85px] w-[85px] bg-gray-200 flex items-center justify-center rounded">
            <ImageIcon className="w-6 h-6 text-gray-400" />
          </div>
        )}
        <div className="flex-1 flex flex-col items-start">
          <h3 className="font-medium text-sm mb-1 line-clamp-1">
            {current.productName}
          </h3>
          {current.sku && (
            <p className="text-xs text-gray-500 mb-1">SKU: {current.sku}</p>
          )}
          {current.variantName && (
            <p className="text-xs text-gray-500 mb-1">
              Phân loại: {current.variantName}
            </p>
          )}
          <div className="justify-between flex w-full">
            {typeof current.price !== "undefined" && (
              <p className="text-red-500 font-semibold mt-1">
                <PriceTag value={current.price as number} />
              </p>
            )}
          </div>
        </div>
        <Button
          className="bg-[#B0F847]/90 absolute bottom-2 right-2 text-black rounded-full h-8 w-8 cursor-pointer flex items-center justify-center hover:bg-[#B0F847]/70 disabled:opacity-50"
          disabled
          aria-label="Đang ghim"
        >
          <Pin size={16} />
        </Button>
      </div>
    </Card>
  );
}

export default PinProductHost;
