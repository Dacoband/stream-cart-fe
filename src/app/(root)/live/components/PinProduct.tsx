"use client";

import React from "react";
import { getPinProductLiveStream } from "@/services/api/livestream/productLivestream";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import PriceTag from "@/components/common/PriceTag";
import { Button } from "@/components/ui/button";
import { useLivestreamRealtime } from "@/services/signalr/useLivestreamRealtime";

type Props = { livestreamId: string };

function PinProduct({ livestreamId }: Props) {
  type PinnedView = {
    productName?: string;
    productImageUrl?: string;
    price?: number;
    sku?: string;
    variantName?: string;
    isPin?: boolean;
  };
  const [pinned, setPinned] = React.useState<PinnedView | null>(null);
  const { pinnedProducts, lastPinChange, refreshPinned } =
    useLivestreamRealtime(livestreamId);

  const toStr = React.useCallback(
    (v: unknown) => (typeof v === "string" ? v : undefined),
    []
  );
  const toNum = React.useCallback(
    (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : undefined),
    []
  );
  const toBool = React.useCallback(
    (v: unknown) => (v === undefined || v === null ? undefined : Boolean(v)),
    []
  );
  const getStr = React.useCallback(
    (obj: Record<string, unknown> | undefined, ...keys: string[]) => {
      if (!obj) return undefined;
      for (const k of keys) {
        const val = obj[k];
        const s = toStr(val);
        if (s !== undefined) return s;
      }
      return undefined;
    },
    [toStr]
  );
  const getNum = React.useCallback(
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
  const getBool = React.useCallback(
    (obj: Record<string, unknown> | undefined, ...keys: string[]) => {
      if (!obj) return undefined;
      for (const k of keys) {
        const b = toBool(obj[k]);
        if (b !== undefined) return b;
      }
      return undefined;
    },
    [toBool]
  );

  const fetchPinned = React.useCallback(async () => {
    try {
      const data = await getPinProductLiveStream(livestreamId);
      const raw = (Array.isArray(data) ? data[0] : data) as
        | Record<string, unknown>
        | undefined;
      const isPinned = getBool(raw, "isPin", "isPinned") ?? false;
      if (!raw || !isPinned) return setPinned(null);
      const view: PinnedView = {
        productName: getStr(raw, "productName", "ProductName"),
        productImageUrl: getStr(
          raw,
          "productImageUrl",
          "ProductImageUrl",
          "imageUrl",
          "ImageUrl"
        ),
        price: getNum(raw, "price", "Price"),
        sku: getStr(raw, "sku", "SKU", "Sku"),
        variantName: getStr(raw, "variantName", "VariantName"),
        isPin: isPinned,
      };
      setPinned(view);
    } catch {
      setPinned(null);
    }
  }, [livestreamId, getStr, getNum, getBool]);

  React.useEffect(() => {
    // initial load from API and ask server for pinned list
    fetchPinned();
    refreshPinned().catch(() => {});
  }, [fetchPinned, refreshPinned]);

  // When server reports pin status change, refresh from API to get full details
  React.useEffect(() => {
    if (!lastPinChange) return;
    fetchPinned();
  }, [lastPinChange, fetchPinned]);

  // Try to map pinnedProducts pushed from server directly, fallback to API if shape unknown
  React.useEffect(() => {
    if (!pinnedProducts || pinnedProducts.length === 0) {
      setPinned(null);
      return;
    }
    const first = pinnedProducts[0] as Record<string, unknown>;
    if (!first) return;
    // Best-effort mapping from server payload
    const mapped: PinnedView = {
      productName: getStr(first, "productName", "ProductName"),
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
      isPin: (getBool(first, "isPin", "IsPin") ?? true) as boolean,
    };

    // If we don't have minimum fields, fallback to API
    if (!mapped || !mapped.productName) {
      fetchPinned();
    } else {
      setPinned(mapped);
    }
  }, [pinnedProducts, fetchPinned, livestreamId, getStr, getNum, getBool]);

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
          className="absolute bottom-2 right-2 text-[12px] py-1 cursor-pointer px-2 rounded-none h-fit bg-gradient-to-r from-orange-500 to-red-500 hover:bg-[#B0F847]/80 font-semibold text-white"
        >
          Mua ngay
        </Button>
      </div>
    </Card>
  );
}

export default PinProduct;
