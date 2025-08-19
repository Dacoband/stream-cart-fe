"use client";

import React, { useCallback, useRef } from "react";
import { ProductLiveStream } from "@/types/livestream/productLivestream";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ImageIcon, Pin, PinOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import PriceTag from "@/components/common/PriceTag";
import { useLivestreamRealtime } from "@/services/signalr/useLivestreamRealtime";

type Props = {
  livestreamId?: string; // enable realtime subscribe when provided
  pinned?: ProductLiveStream | null; // optional initial/fallback
  onUnpinned?: () => void; // parent can refresh if needed
};

function PinProduct({ livestreamId, pinned, onUnpinned }: Props) {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [current, setCurrent] = React.useState<ProductLiveStream | null>(
    pinned ?? null
  );
  const loadingRef = useRef(false);

  // Subscribe to realtime if livestreamId is available; still expose actions without it
  const realtime = useLivestreamRealtime(livestreamId);

  // Request server to push pinned list to this client/group via SignalR
  const refreshPinnedRealtime = useCallback(async () => {
    if (!livestreamId) return;
    if (loadingRef.current) return; // tránh spam
    loadingRef.current = true;
    try {
      await (realtime.refreshPinned?.() ?? Promise.resolve());
    } finally {
      loadingRef.current = false;
    }
  }, [livestreamId, realtime]);

  // keep in sync with prop changes (fallback path)
  React.useEffect(() => {
    setCurrent(pinned ?? null);
  }, [pinned]);

  // initial realtime refresh + API fallback to get id/details
  React.useEffect(() => {
    if (!livestreamId) return;
    refreshPinnedRealtime();
  }, [livestreamId, refreshPinnedRealtime]);

  // when server signals pin status changed, refresh from API to ensure we have id
  React.useEffect(() => {
    if (!livestreamId) return;
    if (!realtime.lastPinChange) return;
    refreshPinnedRealtime();
  }, [realtime.lastPinChange, refreshPinnedRealtime, livestreamId]);

  // also map live pinnedProducts push if present; still prefer API for full details
  React.useEffect(() => {
    if (!livestreamId) return;
    const list = realtime.pinnedProducts as unknown[] | undefined;
    if (!list || list.length === 0) {
      setCurrent(null);
      return;
    }
    const first = (list[0] ?? {}) as Record<string, unknown>;
    // Safe getters from mixed-case payloads
    const get = (obj: Record<string, unknown>, keys: string[]): unknown => {
      for (const k of keys) if (obj[k] !== undefined) return obj[k];
      return undefined;
    };
    const toStr = (v: unknown) => (v == null ? undefined : String(v));
    const toNum = (v: unknown) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };

    const mapped: Partial<ProductLiveStream> = {
      id: toStr(get(first, ["id", "Id", "ID"])) || "",
      livestreamId:
        toStr(get(first, ["livestreamId", "LivestreamId"])) ||
        (livestreamId as string),
      productId: toStr(get(first, ["productId", "ProductId"])) || "",
      variantId: toStr(get(first, ["variantId", "VariantId"])) || "",
      isPin: Boolean(get(first, ["isPin", "IsPin"])) ?? true,
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
    } as Partial<ProductLiveStream>;

    // If we don't have minimum fields (id), just clear; seller surface must supply id from server
    if (!mapped.id) {
      setCurrent(null);
      return;
    }
    setCurrent(mapped as ProductLiveStream);
  }, [realtime.pinnedProducts, livestreamId]);

  const handleTogglePin = async () => {
    if (!current) return;
    try {
      setLoading(true);
      // prefer realtime broadcast; fallback to REST
      if (current.id) {
        await (realtime.pinById?.(current.id, false) ?? Promise.resolve());
      } else if (current.productId) {
        await (realtime.pinProduct?.(
          current.productId,
          current.variantId || null,
          false
        ) ?? Promise.resolve());
      }
      setCurrent(null);
      onUnpinned?.();
    } finally {
      setLoading(false);
    }
  };

  if (!current) return null;

  return (
    <Card className="py-2.5 px-2.5 rounded-none gap-2 border-white w-[350px] bg-white/70">
      <div className="flex justify-between border-b pb-1 font-medium text-gray-600 text-sm">
        Sản phẩm được ghim
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
          onClick={handleTogglePin}
          disabled={loading}
          className="bg-[#B0F847]/90 absolute bottom-2 right-2 text-black rounded-full h-8 w-8 cursor-pointer flex items-center justify-center hover:bg-[#B0F847]/70 disabled:opacity-50"
          aria-label={current.isPin ? "Bỏ ghim" : "Ghim"}
        >
          {current.isPin ? <PinOff size={16} /> : <Pin size={16} />}
        </Button>
      </div>
    </Card>
  );
}

export default PinProduct;
