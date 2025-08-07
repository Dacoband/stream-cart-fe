import React from "react";
import { Shop } from "@/types/shop/shop";
import Image from "next/image";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

// import { getCategoryById } from "@/services/api/categories/categorys";

interface ProfileStoreProps {
  shop: Shop;
}

function ProfileStore({ shop }: ProfileStoreProps) {
  return (
    <div className="w-[70%] mx-auto ">
      <div className="relative  ">
        <div className="absolute inset-0 bg-gray-950/30 pointer-events-none rounded"></div>
        <Image
          src={shop.coverImageURL}
          alt={shop.shopName}
          width={1200}
          height={300}
          quality={100}
          className="w-full h-[280px] object-cover"
        />
      </div>
      <div>
        <div>
          {" "}
          <Avatar className="w-32 h-32 cursor-pointer border">
            <AvatarImage
              src={shop.logoURL}
              className="object-cover w-full h-full"
            />
          </Avatar>
          ss
        </div>
      </div>
    </div>
  );
}

export default ProfileStore;
