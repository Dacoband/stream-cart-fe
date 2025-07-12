"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NotFound from "@/components/common/NotFound";
import { Shop } from "@/types/shop/shop";
import { getshopById } from "@/services/api/shop/shop";
import ProfileStore from "./components/ProfileStore";
import LoadingScreen from "@/components/common/LoadingScreen";
import { Card } from "@/components/ui/card";

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
    <div className="flex flex-col  mx-auto -mt-0.5  mb-20">
      <Card className="bg-white  w-full p-0">
        <ProfileStore shop={shop} />
      </Card>
    </div>
  );
}
