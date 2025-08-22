"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import PriceTag from "@/components/common/PriceTag";
import { useLivestreamRealtime } from "@/services/signalr/useLivestreamRealtime";
type PinProductProps = {
  livestreamId: string;
};

type PinnedProduct = {
  productName: string;
  productImageUrl?: string;
  price?: number;
  sku?: string;
  variantName?: string;
};

export default function PinProduct({ livestreamId }: PinProductProps) {
  const [pinned, setPinned] = useState<PinnedProduct | null>(null);
  const { pinnedProducts, lastPinChange, refreshPinned } =
    useLivestreamRealtime(livestreamId);
  const lastFetchAtRef = useRef<number>(0);

  // safe mappers for mixed-casing payloads
  const toStr = useCallback(
    (v: unknown) => (typeof v === "string" ? v : undefined),
    []
  );
  const toNum = useCallback(
    (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : undefined),
    []
  );
  const getStr = useCallback(
    (obj: Record<string, unknown> | undefined, ...keys: string[]) => {
      if (!obj) return undefined;
      for (const k of keys) {
        const s = toStr(obj[k]);
        if (s !== undefined) return s;
      }
      return undefined;
    },
    [toStr]
  );
  const getNum = useCallback(
    (obj: Record<string, unknown> | undefined, ...keys: string[]) => {
      if (!obj) return undefined;
      for (const k of keys) {
        const n = toNum(obj[k]);
        if (n !== undefined) return n;
      }
      return undefined;
    },
    [toNum]
  );

  /** Lần đầu mount → gọi hub để lấy pinned */
  useEffect(() => {
    (async () => {
      try {
        await refreshPinned();
      } catch (err) {
        console.error("refreshPinned (hub) failed", err);
      }
    })();
  }, [refreshPinned]);

  /** Khi có event pin/unpin → hạn chế gọi hub refresh (debounce) */
  useEffect(() => {
    if (!lastPinChange) return;
    const now = Date.now();
    if (now - lastFetchAtRef.current < 900) return; // debounce ~0.9s
    lastFetchAtRef.current = now;
    (async () => {
      try {
        await refreshPinned();
      } catch (err) {
        console.error("refreshPinned (hub) failed", err);
      }
    })();
  }, [lastPinChange, refreshPinned]);

  /** Nếu socket push data thì update luôn */
  useEffect(() => {
    if (!pinnedProducts || pinnedProducts.length === 0) {
      setPinned(null);
      return;
    }
    const first = pinnedProducts[0] as Record<string, unknown> | undefined;
    if (!first) return;
    const mapped: PinnedProduct = {
      productName: getStr(first, "productName", "ProductName") || "",
      productImageUrl: getStr(
        first,
        "productImageUrl",
        "ProductImageUrl",
        "imageUrl",
        "ImageUrl"
      ),
      price: getNum(first, "price", "Price"),
      sku: getStr(first, "sku", "SKU", "Sku"),
      variantName: getStr(first, "variantName", "VariantName"),
    };
    // if productName is missing, ask hub for a refresh
    if (!mapped.productName) {
      (async () => {
        try {
          await refreshPinned();
        } catch (err) {
          console.error("refreshPinned (hub) failed", err);
        }
      })();
    } else {
      setPinned(mapped);
    }
  }, [pinnedProducts, getStr, getNum, refreshPinned]);

  if (!pinned) return null;

  return (
    <Card className="py-2 px-2 absolute top-10 left-4 rounded-none gap-2 border-white w-[350px] bg-white/70">
      <div className="flex justify-between border-b pb-1 font-medium text-gray-600 text-sm">
        Sản phẩm đang ghim
      </div>
      <div className="flex gap-3">
        {pinned.productImageUrl ? (
          <Image
            height={85}
            width={85}
            src={pinned.productImageUrl}
            alt={pinned.productName || "Pinned product"}
            className="rounded object-cover h-[85px] w-[85px]"
          />
        ) : (
          <div className="h-[85px] w-[85px] bg-gray-200 flex items-center justify-center rounded">
            <ImageIcon className="w-6 h-6 text-gray-400" />
          </div>
        )}
        <div className="flex-1 flex flex-col items-start">
          <h3 className="font-medium text-sm mb-1 line-clamp-1">
            {pinned.productName}
          </h3>
          {pinned.sku && (
            <p className="text-xs text-gray-500 mb-1">SKU: {pinned.sku}</p>
          )}
          {pinned.variantName && (
            <p className="text-xs text-gray-500 mb-1">
              Phân loại: {pinned.variantName}
            </p>
          )}
          <div className="justify-between flex w-full">
            {typeof pinned.price !== "undefined" && (
              <p className="text-red-500 font-semibold mt-1">
                <PriceTag value={pinned.price as number} />
              </p>
            )}
          </div>
        </div>
        <Button
          size="sm"
          className="absolute bottom-2 right-2 text-xs px-3 py-1 rounded bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:opacity-90"
        >
          Mua ngay
        </Button>
      </div>
    </Card>
  );
}
