"use client";

import React from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { getProductDetailById } from "@/services/api/product/product";
import type { ProductDetail } from "@/types/product/product";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function formatVND(n?: number) {
  return typeof n === "number"
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(n)
    : "—";
}

export default function ProductPreviewPage() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = React.useState<ProductDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getProductDetailById(productId);
        if (mounted) setProduct(res ?? null);
      } catch (e) {
        console.error(e);
        if (mounted) setError("Không thể tải sản phẩm");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [productId]);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Xem nhanh sản phẩm</h1>
      <Card className="bg-white p-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <Skeleton className="w-full aspect-square rounded-md" />
            <div className="space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-6 w-1/4" />
            </div>
          </div>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : !product ? (
          <p className="text-muted-foreground">Không tìm thấy sản phẩm</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="w-full">
              <div className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-50">
                <Image
                  src={product.primaryImage?.[0] || "/assets/emptyData.png"}
                  alt={product.productName}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="text-2xl font-semibold">{product.productName}</h2>
              <div className="text-green-700 text-xl font-medium">
                Giá: {formatVND(product.finalPrice)}
              </div>
              <div className="text-gray-700">
                Số lượng: {product.stockQuantity}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
