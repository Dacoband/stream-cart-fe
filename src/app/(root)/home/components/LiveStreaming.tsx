import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { fakeLiveStreams } from "@/fake data/LiveStream";
import { Button } from "@/components/ui/button";

function LiveStreaming() {
  return (
    <div
      className="flex flex-col px-10 py-5 w-full rounded-xl"
      style={{
        background:
          "linear-gradient(to bottom, #BDF965 20%, #ffffff ,#ffffff )",
        boxShadow: "0 0 20px rgba(148, 163, 184, 0.3)",
      }}
    >
      <div className="flex justify-between">
        <div className="flex text-gray-800 items-center text-2xl font-bold  gap-2 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-8"
          >
            <path
              fillRule="evenodd"
              d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
              clipRule="evenodd"
            />
          </svg>
          XEM LIVE SIÊU HỜI:
        </div>
        <Button className="cursor-pointer rounded-md px-5 font-normal">
          Xem thêm
        </Button>
      </div>

      <div className="grid grid-cols-4 justify-between pt-2 gap-2 mb-5">
        {fakeLiveStreams.map((live, index) => (
          <Card
            key={index}
            className=" p-0 hover:shadow-lg gap-2 transition-all duration-300 cursor-pointer hover:scale-102 shadow-none "
          >
            <CardHeader className="p-0 m-0 relative">
              <Image
                src={live.thumbnailUrl}
                alt={live.title}
                width={400}
                height={200}
                className="w-full h-72 object-cover rounded-t-xl"
              />
              <div className="absolute top-3 left-3 bg-red-500 text-white  px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 z-10 shadow">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>LIVE</span>
              </div>
            </CardHeader>
            <CardContent className="px-4 pt-1 pb-5 my-0 flex gap-2.5 items-center">
              <div className="relative w-18 h-18 flex justify-center items-center">
                <div className="absolute inset-0 w-full h-full  bg-[#e2f8c2] rounded-full animate-pulse z-0"></div>

                <Image
                  src={live.shopImage}
                  alt={live.shopName}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover rounded-full z-10 relative border-[3px] border-[#aafa32]"
                />
              </div>
              <div>
                <div className="text-base font-medium ">{live.title}</div>
                <span className="text-base  text-gray-600">
                  {live.shopName}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default LiveStreaming;
