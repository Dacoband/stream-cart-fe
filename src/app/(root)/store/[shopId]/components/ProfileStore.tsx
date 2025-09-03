"use client";

import React from "react";
import { Shop } from "@/types/shop/shop";
import Image from "next/image";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Star, Clock, Users, Package } from "lucide-react";
// import { useRouter } from "next/navigation";

interface ProfileStoreProps {
  shop: Shop;
  onOpenShop?: (open: boolean) => void;
}

function ProfileStore({ shop, onOpenShop }: ProfileStoreProps) {
  return (
    <div className="w-full bg-white">
      {/* Cover Image */}
      <div className="relative h-[280px] overflow-hidden">
        <Image
          src={shop.coverImageURL || "/assets/default-cover.jpg"}
          alt={shop.shopName}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Profile Section */}
      <div className="px-8 pb-8">
        <div className="flex items-start gap-6 -mt-16 relative z-10">
          {/* Avatar */}
          <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
            <AvatarImage
              src={shop.logoURL || "/assets/default-avatar.png"}
              alt={shop.shopName}
              className="object-cover"
            />
          </Avatar>

          {/* Shop Info */}
          <div className="flex-1 mt-16">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {shop.shopName}
                </h1>
                <p className="text-gray-600 mb-4 max-w-2xl">
                  {shop.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-8 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">
                      {shop.ratingAverage || 0}
                    </span>
                    <span className="text-gray-500">
                      ({shop.totalAverage || 0} đánh giá)
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Package className="w-4 h-4" />
                    <span>{shop.totalProduct || 0} Sản phẩm</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Người theo dõi</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      Tham gia{" "}
                      {new Date(shop.registrationDate).getFullYear() ||
                        new Date().getFullYear()}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-4 mt-3">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      shop.status
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {shop.status ? "Đang hoạt động" : "Tạm ngưng"}
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      shop.approvalStatus === "Approved"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {shop.approvalStatus || "Chờ duyệt"}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center my-auto h-full">
                <Button
                  type="button"
                  className="gap-2 bg-[#B0F847] text-black hover:bg-[#B0F847]/80 hover:text-black/80"
                  onClick={() => onOpenShop?.(true)}
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat ngay
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileStore;
