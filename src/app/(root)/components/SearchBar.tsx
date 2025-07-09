import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import React from "react";

export default function SearchBar() {
  return (
    <div className="flex items-center gap-2 ml-8">
      <div className="relative">
        <Input
          type="text"
          placeholder="Tìm kiếm sản phẩm, cửa hàng..."
          className=" pr-4 py-5 w-2xl rounded-md bg-white text-black text-xl "
        />
        <div className="absolute bg-gradient-to-r from-[#B0F847]  via-[#c6ef88]  to-[#B0F847] py-1.5 rounded-sm px-3.5 right-1.5 top-1/2 -translate-y-1/2 cursor-pointer">
          <Search className="text-black " />
        </div>
      </div>
    </div>
  );
}
