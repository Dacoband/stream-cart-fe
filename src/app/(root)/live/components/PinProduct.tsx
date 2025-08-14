"use client";

import React from "react";
import { getPinProductLiveStream } from "@/services/api/livestream/productLivestream";
import type { ProductLiveStream } from "@/types/livestream/productLivestream";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import PriceTag from "@/components/common/PriceTag";
import { Button } from "@/components/ui/button";

type Props = { livestreamId: string };

function PinProduct({ livestreamId }: Props) {
  const [pinned, setPinned] = React.useState<ProductLiveStream | null>(null);

  const fetchPinned = React.useCallback(async () => {
    try {
      const data = await getPinProductLiveStream(livestreamId);
      const item = Array.isArray(data) ? data[0] : data;
      setPinned(item && (item.isPin ?? item.isPinned) ? item : null);
    } catch {
      setPinned(null);
    }
  }, [livestreamId]);

  React.useEffect(() => {
    fetchPinned();
  }, [fetchPinned]);

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
