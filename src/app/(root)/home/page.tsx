import React from "react";
import Advertisement from "./components/Advertisement";
import Category from "./components/Category";
import LiveStreaming from "./components/LiveStreaming";
export default function Home() {
  return (
    <div className="flex flex-col w-full gap-5 ">
      <div className="w-full bg-white shadow-sm">
        <Advertisement />
      </div>
      <div className="flex flex-col gap-5 w-[80%] mx-auto">
        <Category />
        <LiveStreaming />
      </div>
    </div>
  );
}
