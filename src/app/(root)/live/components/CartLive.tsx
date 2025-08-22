"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLivestreamCart } from "@/services/signalr/useLivestreamCart";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import PriceTag from "@/components/common/PriceTag";
import { getAddressDefaultShipping } from "@/services/api/address/address";
function CartLive({ livestreamId }: { livestreamId?: string }) {
  const { cart, loading, error, updateQty, deleteItem } =
    useLivestreamCart(livestreamId);
  const router = useRouter();

  const handleConfirm = React.useCallback(async () => {
    if (!cart || (cart.totalItems ?? 0) <= 0) return;

    const params = new URLSearchParams();
    for (const it of cart.items) params.append("cartItemIds", it.id);
    params.set("live", "1");

    const id = livestreamId ?? cart.livestreamId;
    if (id) params.set("livestreamId", id);

    try {
      const address = await getAddressDefaultShipping();
      if (address && address.id) {
        params.set("addressId", address.id);
      }
    } catch (err) {
      console.error("Lỗi khi lấy địa chỉ mặc định:", err);
    }

    router.push(`/customer/order?${params.toString()}`);
  }, [router, cart, livestreamId]);

  return (
    <div className="bg-white relative flex w-full rounded-none h-[87vh] flex-col">
      <div className="p-0 flex-1 overflow-y-auto custom-scroll mb-40">
        {loading ? (
          <div className="p-4 text-sm text-gray-500">Đang tải giỏ hàng…</div>
        ) : error ? (
          <div className="p-4 text-sm text-red-600">{error}</div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            Chưa có sản phẩm nào
          </div>
        ) : (
          <div className="">
            {cart.items.map((it) => (
              <div key={it.id} className="relative flex gap-3 p-3 items-start">
                <button
                  aria-label="Xóa sản phẩm khỏi giỏ"
                  onClick={() => deleteItem(it.id)}
                  className="absolute top-2 right-2 p-1 cursor-pointer rounded hover:bg-red-50 text-red-600"
                  title="Xóa"
                >
                  <X className="w-4 h-4" />
                </button>
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
                  <div className="font-medium text-sm line-clamp-1 mr-5">
                    {it.productName}
                  </div>

                  <div className="text-xs text-gray-500 mt-0.5 whitespace-pre-wrap">
                    {it.variantName && <span>{it.variantName}</span>}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="text-red-600 font-semibold ">
                      <PriceTag value={it.livestreamPrice} />
                    </div>
                    <div className="flex items-center border rounded overflow-hidden">
                      <Button
                        onClick={() =>
                          updateQty(it.id, Math.max(0, it.quantity - 1))
                        }
                        disabled={it.quantity <= 0}
                        className="h-7 w-7 p-0 rounded-none"
                        variant="outline"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-6 text-center text-xs">
                        {it.quantity}
                      </span>
                      <Button
                        onClick={() =>
                          updateQty(it.id, Math.min(it.stock, it.quantity + 1))
                        }
                        disabled={it.quantity >= it.stock}
                        className="h-7 w-7 p-0 rounded-none"
                        variant="outline"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer totals + confirm */}
      <div className="px-3 pt-5 pb-8 h-36 border-t  bg-gray-100 absolute bottom-0 left-0 right-0">
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
        <Button
          className="w-full mt-3 cursor-pointer"
          onClick={handleConfirm}
          disabled={!cart || (cart.totalItems ?? 0) <= 0}
        >
          Xác nhận đặt hàng
        </Button>
      </div>
    </div>
  );
}

export default CartLive;
