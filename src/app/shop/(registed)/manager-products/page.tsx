import { Button } from "@/components/ui/button";
import React from "react";
import { CirclePlus } from "lucide-react";
import { TableProducts } from "./components/TableProducts";
function page() {
  return (
    <div className="flex flex-col gap-5 min-h-full">
      <div className="bg-white sticky top-0  z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
        <div className="">
          <h2 className="text-xl font-bold">Danh sách sản phẩm</h2>
          {/* <h2 className="text-black/70">
            Quản lý toàn bộ sản phẩm của cửa hàng
          </h2> */}
        </div>
        <Button className="bg-[#B0F847] text-black shadow flex gap-2 py-5 text-base cursor-pointer hover:bg-[#B0F847]/80 hover:text-black/80">
          <CirclePlus />
          Thêm sản phẩm
        </Button>
      </div>
      <div className="flex flex-col gap-5 mx-5 mb-10">
        <TableProducts />
      </div>
    </div>
  );
}

export default page;
