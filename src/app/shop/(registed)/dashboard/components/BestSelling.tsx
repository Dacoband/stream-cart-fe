"use client";

import { Card } from "@/components/ui/card";
import React from "react";
import Image from "next/image";
import { useAuth } from "@/lib/AuthContext";
import rootApi from "@/services/rootApi";

type Product = {
  id: string;
  productName: string;
  primaryImageUrl?: string | null;
  finalPrice: number;
  basePrice?: number | null;
  discountPercentage?: number;
  quantitySold?: number;
};

function BestSelling() {
  const { user } = useAuth();
  const [items, setItems] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user?.shopId) return;
    let mounted = true;
    const fetchTrending = async () => {
      setLoading(true);
      try {
        const res = await rootApi.get(`/products/shop/${user.shopId}/trending`, { params: { limit: 5 } });
        if (res?.data?.success && mounted) setItems(res.data.data || []);
      } catch (err) {
        console.error("Fetch trending error", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchTrending();
    return () => { mounted = false };
  }, [user?.shopId]);

  return (
    <Card className="p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-xl">Sản phẩm bán chạy</h3>
        <a className="text-sm text-primary-600 hover:underline" href="/shop/products">Xem tất cả</a>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-md" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-500">
          Chưa có sản phẩm trending. <a className="text-primary-600 underline" href="/shop/products/new">Thêm sản phẩm</a>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((p) => (
            <li key={p.id} className="flex items-center gap-3 hover:shadow-sm p-2 rounded-md transition">
              <div className="w-16 h-16 shrink-0 rounded-md bg-gray-100 overflow-hidden">
                {p.primaryImageUrl ? (
                  <Image src={p.primaryImageUrl} alt={p.productName} width={64} height={64} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">No image</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{p.productName}</div>
                <div className="text-xs text-gray-500 truncate">{p.quantitySold ? `${p.quantitySold} đã bán` : "0 đã bán"}</div>
              </div>

              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">{p.finalPrice.toLocaleString('vi-VN')} đ</div>
                {p.discountPercentage ? (
                  <div className="text-xs text-red-500 line-through opacity-70">{p.basePrice?.toLocaleString('vi-VN')} đ</div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default BestSelling;
