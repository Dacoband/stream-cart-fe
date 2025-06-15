import React from "react";
import Advertisement from "./components/advertisement";
import Category from "./components/Category";
import LiveStreaming from "./components/LiveStreaming";
export default function Home() {
  return (
    <div className="flex flex-col w-full gap-5 ">
      <Advertisement />

      <Category />
      <LiveStreaming />
    </div>
  );
}
