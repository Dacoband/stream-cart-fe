"use client";

import React from "react";
import { useLivestreamCart } from "@/services/signalr/useLivestreamCart";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import PriceTag from "@/components/common/PriceTag";

function CartLive({ livestreamId }: { livestreamId?: string }) {
  const { cart, loading, error, updateQty, lastEvent } =
    useLivestreamCart(livestreamId);
  const [banner, setBanner] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (lastEvent?.action === "ITEM_ADDED") {
      const msg =
        lastEvent.message ||
        `Đã thêm ${lastEvent.quantity ?? ""} ${
          lastEvent.productName ?? "sản phẩm"
        }`;
      setBanner(msg);
      const t = setTimeout(() => setBanner(null), 2000);
      return () => clearTimeout(t);
    }
  }, [lastEvent]);

  return (
    <div className="bg-white rounded-none h-full border">
      <div className="p-0">
        {banner && (
          <div className="px-3 py-2 text-sm bg-green-50 text-green-700 border-b border-green-200">
            {banner}
          </div>
        )}
        {loading ? (
          <div className="p-4 text-sm text-gray-500">Đang tải giỏ hàng…</div>
        ) : error ? (
          <div className="p-4 text-sm text-red-600">{error}</div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            Chưa có sản phẩm nào
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto divide-y">
            {cart.items.map((it) => (
              <div key={it.id} className="flex gap-3 p-3 items-start">
                <div className="flex-shrink-0">
                  {it.primaryImage ? (
                    <Image
                      src={it.primaryImage}
                      alt={it.productName}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm line-clamp-1">
                    {it.productName}
                  </div>
                  {it.variantId && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      SKU/Variant: {it.variantId}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-red-600 font-semibold">
                      <PriceTag value={it.livestreamPrice} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() =>
                          updateQty(it.id, Math.max(0, it.quantity - 1))
                        }
                        disabled={it.quantity <= 0}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-6 text-center text-sm">
                        {it.quantity}
                      </span>
                      <Button
                        onClick={() =>
                          updateQty(it.id, Math.min(it.stock, it.quantity + 1))
                        }
                        disabled={it.quantity >= it.stock}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer totals */}
        {/* <div className="p-3 border-t bg-gray-50">
          <div className="flex justify-between text-sm">
            <span>Tổng số lượng</span>
            <span>{cart?.totalItems ?? 0}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span>Tạm tính</span>
            <span className="font-semibold text-red-600">
              <PriceTag value={cart?.totalAmount ?? 0} />
            </span>
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default CartLive;
