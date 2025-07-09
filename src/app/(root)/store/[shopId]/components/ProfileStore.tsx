import React from "react";
import { Shop } from "@/types/shop/shop";
import Image from "next/image";

// import { getCategoryById } from "@/services/api/categories/categorys";

interface ProfileStoreProps {
  shop: Shop;
}

function ProfileStore({ shop }: ProfileStoreProps) {
  return (
    <div>
      <div className="relative w-full ">
        <Image
          src={shop.coverImageURL}
          alt={shop.shopName}
          width={1200}
          height={300}
          className="w-full h-[240px] object-cover object-center "
        />
      </div>
    </div>
  );
}

export default ProfileStore;
