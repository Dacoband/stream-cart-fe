"use client";

import React from "react";

import dynamic from "next/dynamic";

export default function Home() {
  const Advertisement = dynamic(() => import("./components/advertisement"));
  const Category = dynamic(() => import("./components/Category"));
  const LiveStreaming = dynamic(() => import("./components/LiveStreaming"));
  const FlashSale = dynamic(() => import("./components/FlashSale"));
  const RecommendedProducts = dynamic(
    () => import("./components/RecommendedProducts")
  );

  return (
    <div className="flex flex-col w-[80%] mx-auto gap-5 mb-16 mt-2">
      <Advertisement />

      <Category />
      <LiveStreaming />
      <FlashSale />
      <RecommendedProducts />
    </div>
  );
}
