"use client";

import React, { useEffect, useState } from "react";
import { FormatDate } from "@/components/common/FormatDate";
import PriceTag from "@/components/common/PriceTag";
import { Card, CardContent } from "@/components/ui/card";
import { Order } from "@/types/order/order";
import { getStatusText, OrderStatus } from "@/types/order/orderStatus";
import Image from "next/image";
import Link from "next/link";
import { getProductDetailById } from "@/services/api/product/product";
import { getshopById } from "@/services/api/shop/shop";
import { Shop } from "@/types/shop/shop";
import { Store } from "lucide-react";
interface OrderItemProps {
  order: Order;
}

export function OrderItem({ order }: OrderItemProps) {
  const statusText = getStatusText(order.orderStatus as OrderStatus);
  const [shop, setShop] = useState<Shop | null>(null);
  const [itemAttributes, setItemAttributes] = useState<
    Record<string, Record<string, string>>
  >({});

  useEffect(() => {
    let cancelled = false;
    const fetchShop = async () => {
      if (!order.shopId) return;
      try {
        const res = await getshopById(order.shopId);
        if (!cancelled) setShop(res || null);
      } catch {
        if (!cancelled) setShop(null);
      } finally {
        // no-op
      }
    };
    fetchShop();
    return () => {
      cancelled = true;
    };
  }, [order.shopId]);

  useEffect(() => {
    let cancelled = false;
    const fetchAttributes = async () => {
      const attrMap: Record<string, Record<string, string>> = {};
      const items = order.items || [];
      if (!items.length) {
        if (!cancelled) setItemAttributes({});
        return;
      }
      await Promise.all(
        items.map(async (item) => {
          try {
            if (item.productId && item.variantId) {
              const detail = await getProductDetailById(item.productId);
              const variant = detail?.variants?.find(
                (v: { variantId: string }) => v.variantId === item.variantId
              );
              if (variant?.attributeValues) {
                attrMap[item.id] = variant.attributeValues;
              }
            }
          } catch {
            // ignore per-item errors
          }
        })
      );
      if (!cancelled) setItemAttributes(attrMap);
    };
    fetchAttributes();
    return () => {
      cancelled = true;
    };
  }, [order.items]);

  const getStatusTextColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Cancelled:
      case OrderStatus.Refunded:
        return "bg-red-600";
      case OrderStatus.Waiting:
        return "bg-orange-600";
      default:
        return "bg-lime-600";
    }
  };

  return (
    <Link href={`/customer/order-details/${order.id}`}>
      <Card className="mb-4 rounded-none p-0">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex flex-col gap-1">
              <div className="flex gap-2 items-center w-full">
                <div className="text-orange-600">
                  <Store size={18} />
                </div>
                <span className=" font-medium  text-black/80 w-full">
                  {shop?.shopName || "Cửa hàng"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-black/80 mr-2 pr-2 border-r">
                Mã đơn: {order.orderCode}
              </span>
              <span
                className={`inline-block py-1 px-2 text-xs text-white font-medium ${getStatusTextColor(
                  order.orderStatus as OrderStatus
                )}`}
              >
                {statusText}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {order.items && order.items.length > 0 ? (
              order.items.map((item) => {
                const attrs = itemAttributes[item.id];
                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 relative rounded overflow-hidden bg-gray-100">
                      <Image
                        src={item.productImageUrl || "/assets/emptyData.png"}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 flex justify-between">
                      <div>
                        <div className="font-medium text-sm mb-1">
                          {item.productName}
                        </div>
                        <div>
                          <div className="flex gap-2 text-[12.5px] mt-2 text-gray-600">
                            {attrs &&
                              Object.entries(attrs)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(", ")}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                          Số lượng: {item.quantity}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <PriceTag value={item.unitPrice} className="text-sm" />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>Không có sản phẩm nào trong đơn hàng này</p>
              </div>
            )}
          </div>

          <div className="border-t mt-2 py-2">
            <div className="flex justify-between items-center font-medium mt-2">
              <span>Thành tiền:</span>
              <PriceTag
                value={order.finalAmount}
                className="text-lg text-orange-600"
              />
            </div>
          </div>

          <div className="flex justify-between">
            <div className="text-xs text-gray-600 flex flex-col gap-1.5">
              <div>
                Ngày đặt:
                <FormatDate date={order.orderDate} />
              </div>
              <div>
                Dự kiến:
                <FormatDate date={order.estimatedDeliveryDate} />
              </div>
            </div>
            <div></div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
