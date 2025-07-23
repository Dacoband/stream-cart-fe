import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import React from "react";

export default function SearchBar() {
  return (
    <div className="flex items-center gap-2 ml-8">
      <div className="relative w-2xl">
        <Input
          type="text"
          placeholder="Tìm kiếm sản phẩm, cửa hàng..."
          className="w-full pr-16 py-5 bg-white text-black text-xl rounded-sm"
        />
        <div className="absolute top-0 right-0 h-full flex items-center justify-center px-5 bg-gradient-to-r from-[#B0F847] via-[#c6ef88] to-[#B0F847] cursor-pointer rounded-r-md">
          <Search size={20} className="text-black" />
        </div>
      </div>
    </div>
  );
}
