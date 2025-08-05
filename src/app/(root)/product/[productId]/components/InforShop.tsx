import React from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  BotMessageSquare,
  Boxes,
  Eye,
  MessageSquareMore,
  Star,
} from "lucide-react";
import { ProductDetail } from "@/types/product/product";
import Link from "next/link";
interface InforShopProps {
  product: ProductDetail;
}
function InforShop({ product }: InforShopProps) {
  return (
    <div className="mx-auto px-8 flex justify-between items-center ">
      <div className="flex gap-5 items-center">
        <Link href={`/store/${product.shopId}`}>
          <Avatar className="w-18 h-18 cursor-pointer">
            <AvatarImage
              src={product.shopLogo}
              className="object-cover w-full h-full"
            />
          </Avatar>
        </Link>

        {/* Thông tin shop */}
        <div className="flex flex-col h-16 justify-between">
          <div className="font-semibold text-xl text-gray-800">
            {product.shopName}
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="bg-yellow-100  px-2 py-0.5 rounded text-yellow-700 font-medium flex items-center gap-1">
              <Star className="fill-yellow-500 text-yellow-500" size={16} />
              Đánh Giá: {product.shopRatingAverage}
            </span>
            <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-medium  flex items-center gap-1">
              <Boxes className="fill-orange-600 text-orange-600" size={16} />
              Sản Phẩm: {product.shopTotalProduct}
            </span>
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium  flex items-center gap-1">
              <Boxes className="fill-blue-600 text-blue-600" size={16} />
              Đơn hàng thành công: {product.shopCompleteRate}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          className="gap-1 text-black border-black hover:bg-white hover:text-black/70 hover:border-black/70 cursor-pointer"
        >
          <BotMessageSquare className="w-4 h-4" /> Chat nhanh
        </Button>
        <Button
          variant="outline"
          className="gap-1 text-black border-black hover:bg-white hover:text-black/70 hover:border-black/70 cursor-pointer"
        >
          <MessageSquareMore className="w-4 h-4" /> Chat với shop
        </Button>
        <Button
          asChild
          variant="outline"
          className="gap-1 bg-black text-white  hover:text-white hover:bg-black/80 cursor-pointer"
        >
          <Link href={`/store/${product.shopId}`}>
            <Eye className="w-4 h-4" /> Xem shop
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default InforShop;
