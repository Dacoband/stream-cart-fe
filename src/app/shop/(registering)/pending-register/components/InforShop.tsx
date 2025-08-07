"use client";

import React, { useEffect, useState } from "react";
import { getMyShop } from "@/services/api/shop/shop";
import { Shop } from "@/types/shop/shop";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Calendar, Store } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
function InforShop() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const response = await getMyShop();
        if (response) {
          setShop(response);
        }
      } catch (err) {
        console.error("Error loading user info:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, []);
  useEffect(() => {
    if (shop && shop.approvalStatus === "Approved") {
      router.push("/shop/dashboard");
    }
  }, [shop, router]);

  if (!user) return null;
  if (loading) {
    return <Skeleton className="w-full h-40" />;
  }

  if (!shop) {
    return <div>Không tìm thấy thông tin cửa hàng.</div>;
  }

  if (!user) return null;
  if (loading) {
    return <Skeleton className="w-full h-40" />;
  }

  if (!shop) {
    return <div>Không tìm thấy thông tin cửa hàng.</div>;
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-bold mb-5 flex gap-1.5 items-center">
        <Store size={20} />
        Thông tin cửa hàng:
      </h3>
      <Image
        src={
          shop.coverImageURL ||
          "https://i.pinimg.com/736x/22/7b/cf/227bcf6f33a61d149764bb6ad90e19eb.jpg"
        }
        width={500}
        height={500}
        alt="Cover"
        quality={100}
        className="w-full h-60 object-cover rounded"
      />
      <Separator className="mt-5" />
      <div className=" py-5 px-4">
        <div className="flex gap-4  justify-between ">
          <Image
            src={
              shop.logoURL ||
              "https://i.pinimg.com/736x/22/7b/cf/227bcf6f33a61d149764bb6ad90e19eb.jpg"
            }
            alt="Stream Card Logo"
            width={192}
            height={192}
            quality={100}
            className="w-24 h-24 rounded-full object-cover border"
          />
          <div className="flex-1 flex flex-col items-start justify-center gap-2 ">
            <div className="font-semibold text-2xl text-black">
              {shop.shopName}
            </div>
            <div className="text-gray-500 text-sm">
              <span className="font-semibold mr-2">Chủ cửa hàng:</span>
              {user.username}
            </div>
          </div>
          <div className="gap-2 text-sm w-fix flex flex-col justify-center px-5 bg-blue-50 border border-blue-300 text-blue-600 rounded-md">
            <div className="font-semibold flex gap-1 items-center">
              <Calendar size={20} /> Ngày đăng ký:
            </div>
            {shop.registrationDate
              ? new Date(shop.registrationDate).toLocaleString("vi-VN")
              : "--"}
          </div>
        </div>
        <div className="text-gray-800 text-sm bg-gray-100 mt-5 px-2 py-3 rounded-md">
          <span className="font-semibold mr-2">Mô tả:</span>
          {shop.description}
        </div>
      </div>
    </div>
  );
}

export default InforShop;
