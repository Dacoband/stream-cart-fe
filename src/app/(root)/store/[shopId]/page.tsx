"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NotFound from "@/components/common/NotFound";
import { Shop } from "@/types/shop/shop";
import { getshopById } from "@/services/api/shop/shop";
import ProfileStore from "./components/ProfileStore";
import ProductsGrid from "./components/ProductsGrid";
import LoadingScreen from "@/components/common/LoadingScreen";
import ChatWithShop from "../../components/ChatWithShop";
import ChatBot from "../../components/ChatBot";

export default function StorePage() {
  const { shopId } = useParams<{ shopId: string }>();

  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [openBot, setOpenBot] = useState(false);
  const [openShop, setOpenShop] = useState(false);
  const handleOpenBot = () => {
    setOpenBot((prev) => !prev);
    if (!openBot) setOpenShop(false);
  };
  const handleOpenShop = () => {
    setOpenShop((prev) => !prev);
    if (!openShop) setOpenBot(false);
  };
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
      <div className="w-full justify-center mt-10">
        <NotFound />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Shop Profile */}
        <div className="mb-6">
          <ProfileStore shop={shop} onOpenShop={() => handleOpenShop()} />
        </div>

        {/* Products Grid */}
        <div className="mb-20">
          <ProductsGrid shopId={shopId} />
        </div>
      </div>
      <ChatBot open={openBot} setOpen={handleOpenBot} />
      <ChatWithShop open={openShop} setOpen={setOpenShop} shopId={shopId} />
    </div>
  );
}
