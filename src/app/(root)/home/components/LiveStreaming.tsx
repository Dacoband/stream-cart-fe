import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fakeLiveStreams } from "@/fake data/LiveStream";

function LiveStreaming() {
  return (
    <div
      className="flex flex-col px-10 py-5 w-full bg-white rounded-xl"
      style={{
        boxShadow: "0 0 20px rgba(148, 163, 184, 0.3)",
      }}
    >
      {/* Header */}
      <div className="flex text-[#6b962a] items-center text-xl font-semibold gap-2 mb-4">
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

      <div className="flex flex-wrap justify-between">
        {fakeLiveStreams.map((live, index) => (
          <Card
            key={index}
            className="w-[30%] hover:shadow-lg transition-all duration-300"
          >
            <CardHeader className="p-0">
              <Image
                src={live.thumbnailUrl}
                alt={live.title}
                width={400}
                height={200}
                className="w-full h-48 object-cover rounded-t-xl"
              />
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Image
                  src={live.shopImage}
                  alt={live.shopName}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
                <span className="text-sm font-medium text-gray-700">
                  {live.shopName}
                </span>
              </div>
              <CardTitle className="text-base line-clamp-2">
                {live.title}
              </CardTitle>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default LiveStreaming;
