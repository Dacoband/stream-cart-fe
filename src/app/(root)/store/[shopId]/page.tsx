"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NotFound from "@/components/common/NotFound";
import { Shop } from "@/types/shop/shop";
import { getshopById } from "@/services/api/shop/shop";
import ProfileStore from "./components/ProfileStore";

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

  if (loading) return <div>Đang tải cửa hàng... </div>;
  if (!shop)
    return (
      <div>
        <NotFound />
      </div>
    );

  return (
    <div className="flex w-full ">
      <div className="bg-white h-[300px] w-full">
        <ProfileStore shop={shop} />
      </div>
    </div>
  );
}
