"use client";

import React from "react";
import { updatePinProductLiveStream } from "@/services/api/livestream/productLivestream";
import { ProductLiveStream } from "@/types/livestream/productLivestream";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ImageIcon, Pin, PinOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import PriceTag from "@/components/common/PriceTag";

type Props = {
  pinned: ProductLiveStream | null;
  onUnpinned?: () => void; // parent will refresh
};

function PinProduct({ pinned, onUnpinned }: Props) {
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleTogglePin = async () => {
    if (!pinned) return;
    try {
      setLoading(true);

      await updatePinProductLiveStream(pinned.id, false);
      onUnpinned?.();
    } finally {
      setLoading(false);
    }
  };

  if (!pinned) return null;

  return (
    <Card className="  py-2.5 px-2.5 rounded-none gap-2 border-white w-[350px] bg-white/70">
      <div className="flex justify-between border-b pb-1 font-medium text-gray-600 text-sm">
        Sản phẩm được ghim
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
            )}{" "}
          </div>
        </div>
        <Button
          onClick={handleTogglePin}
          disabled={loading}
          className="bg-[#B0F847]/90 absolute bottom-2 right-2 text-black rounded-full h-8 w-8 cursor-pointer flex items-center justify-center hover:bg-[#B0F847]/70 disabled:opacity-50"
        >
          {pinned.isPin ? <PinOff size={16} /> : <Pin size={16} />}
        </Button>
      </div>
    </Card>
  );
}

export default PinProduct;
