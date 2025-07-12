import React from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
function EmptyCart() {
  return (
    <Card className="flex flex-col justify-center py-14 items-center w-full  mt-20">
      <div className="h-96 w-96 bg-[#B0F847]/20 flex  justify-center items-center rounded-full ">
        <div className="h-80 w-80 bg-[#B0F847]/25 flex  justify-center items-center rounded-full">
          <Image
            src="/assets/emptyCart.png"
            alt="Stream Card Logo"
            width={200}
            height={200}
            quality={100}
          />
        </div>
      </div>
      <div>
        <span className=" text-black/70 font-bold text-xl">
          Oop! Giỏ hàng của bạn đang trống
        </span>
      </div>
      <Link href="/home">
        <Button className="bg-gradient-to-r text-lg from-[#B0F847]  via-[#c6ef88] px-12 py-6 to-[#B0F847] cursor-pointer text-black">
          Mua ngay
        </Button>
      </Link>
    </Card>
  );
}

export default EmptyCart;
