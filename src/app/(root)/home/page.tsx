import React from "react";
import Advertisement from "./components/advertisement";
import Category from "./components/Category";
import LiveStreaming from "./components/LiveStreaming";
import RecommendedProducts from "./components/RecommendedProducts";
import FlashSale from "./components/FlashSale";
export default function Home() {
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
