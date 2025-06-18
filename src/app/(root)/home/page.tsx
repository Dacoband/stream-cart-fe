import React from "react";
import Advertisement from "./components/advertisement";
import Category from "./components/Category";
import LiveStreaming from "./components/LiveStreaming";
import RecommendedProducts from "./components/RecommendedProducts";
export default function Home() {
  return (
    <div className="flex flex-col w-[80%] mx-auto gap-5 mb-16">
      <Advertisement />

      <Category />
      <LiveStreaming />
      <RecommendedProducts />
    </div>
  );
}
