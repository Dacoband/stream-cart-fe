"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NotFound from "@/components/common/NotFound";
import { Shop } from "@/types/shop/shop";
import { getshopById } from "@/services/api/shop/shop";
import ProfileStore from "./components/ProfileStore";
import ProductsGrid from "./components/ProductsGrid";
import LoadingScreen from "@/components/common/LoadingScreen";

export default function StorePage() {
  const { shopId } = useParams<{ shopId: string }>();

  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getshopById(shopId);
        setShop(res);
        console.log("Gọi shopId:", shopId);
      } catch (err) {
        console.error("Lỗi khi gọi API sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [shopId]);

  if (loading)
    return (
      <div>
        <LoadingScreen />
      </div>
    );
  if (!shop)
    return (
      <div>
        <NotFound />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Shop Profile */}
        <div className="mb-6">
          <ProfileStore shop={shop} />
        </div>

        {/* Products Grid */}
        <div className="mb-20">
          <ProductsGrid shopId={shopId} />
        </div>
      </div>
    </div>
  );
}
