import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import Link from "next/link";
import React from "react";
import TableFlashSale from "./components/TableFlashSale";

function page() {
  return (
    <div className="flex flex-col gap-5 min-h-full">
      <div className="bg-white sticky top-0  z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
        <div className="">
          <h2 className="text-xl font-bold">Flash Sale</h2>
        </div>
        <Link href="/shop/manager-flashSale/new-flashSale">
          <Button className="bg-[#B0F847] text-black shadow flex gap-2 py-2 px-4 text-base cursor-pointer hover:bg-[#B0F847]/80 hover:text-black/80">
            <CirclePlus />
            Tạo Flash Sale
          </Button>
        </Link>
      </div>
      <div className="mx-5 mb-10">
        <TableFlashSale />
      </div>
    </div>
  );
}

export default page;
