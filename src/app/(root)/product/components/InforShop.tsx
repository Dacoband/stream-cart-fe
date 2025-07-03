import React from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  BotMessageSquare,
  Boxes,
  MessageSquareMore,
  Star,
  Store,
} from "lucide-react";

function InforShop() {
  return (
    <div className="mx-auto px-8 flex justify-between items-center ">
      <div className="flex gap-5 items-center">
        <Avatar className="w-16 h-16">
          <AvatarImage src="https://i.pinimg.com/736x/8b/8a/ed/8b8aed24d96cefbf7b339b3e5e23bf7e.jpg" />
        </Avatar>

        {/* Thông tin shop */}
        <div className="flex flex-col h-16 justify-between">
          <div className="font-semibold text-xl text-gray-800">Đồ chơi</div>
          <div className="flex flex-wrap gap-2 text-sm">
            {/* <span className="text-blue-600 underline cursor-pointer">
              Seller Ratings 99%
            </span> */}
            <span className="bg-yellow-100  px-2 py-0.5 rounded text-yellow-700 font-medium flex items-center gap-1">
              <Star className="fill-yellow-500 text-yellow-500" size={16} />
              Đánh Giá: 4.8
            </span>
            <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-medium  flex items-center gap-1">
              <Boxes className="fill-orange-600 text-orange-600" size={16} />
              Sản Phẩm: 4.8
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          className="gap-1 bg-[#B0F847] text-black  hover:text-black/70 hover:bg-[#B0F847]/80 cursor-pointer"
        >
          <BotMessageSquare className="w-4 h-4" /> Chat nhanh
        </Button>
        <Button
          variant="outline"
          className="gap-1 bg-[#B0F847] text-black  hover:text-black/70 hover:bg-[#B0F847]/80 cursor-pointer"
        >
          <MessageSquareMore className="w-4 h-4" /> Chat với shop
        </Button>
        <Button
          variant="outline"
          className="gap-1 bg-[#B0F847] text-black  hover:text-black/70 hover:bg-[#B0F847]/80 cursor-pointer"
        >
          <Store className="w-4 h-4" /> Xem shop
        </Button>
      </div>
    </div>
  );
}

export default InforShop;
