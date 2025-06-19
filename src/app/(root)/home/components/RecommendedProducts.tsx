import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { products } from "@/fake data/product";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function RecommendedProducts() {
  return (
    <div
      className="flex flex-col px-10 py-5 w-full bg-white rounded-xl"
      style={{ boxShadow: "0 0 20px rgba(148, 163, 184, 0.3)" }}
    >
      <div className="flex text-gray-800 items-center text-xl font-semibold gap-2 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-8"
        >
          <path d="M7.493 18.5c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.125c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75A.75.75 0 0 1 15 2a2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.777ZM2.331 10.727a11.969 11.969 0 0 0-.831 4.398 12 12 0 0 0 .52 3.507C2.28 19.482 3.105 20 3.994 20H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 0 1-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227Z" />
        </svg>
        ĐỀ XUẤT CHO BẠN:
      </div>
      <div className="grid grid-cols-6 gap-x-8 gap-y-10 pt-2 mb-5">
        {products.map((item) => (
          <Link href={`/product/${item.id}`} key={item.id}>
            <Card className="p-0 h-full rounded-sm border-2 border-transparent hover:border-[#98b869] gap-1 transition-all duration-300 cursor-pointer hover:scale-102">
              <CardHeader className="p-0 h-56 m-0 relative">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={400}
                  height={200}
                  className="h-56  object-center  rounded-t-sm"
                />
              </CardHeader>
              <CardContent className="px-2 pb-2 my-0 flex flex-col ">
                <div className="line-clamp-2 min-h-[3em]">{item.name}</div>
                <div className="flex justify-between items-center">
                  <div className="mt-2 font-semibold text-orange-600">
                    {item.price}đ
                  </div>
                  <div className="mt-2 text-sm text-gray-600 ">Đã bán 150</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <Button className="bg-[#a4ee35] text-black my-8 text-base py-2 hover:text-white cursor-pointer">
        Xem thêm
      </Button>
    </div>
  );
}

export default RecommendedProducts;
