import React from "react";
import Advertisement from "./components/Advertisement";
import Category from "./components/Category";
export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <Advertisement />
      <Category />
    </div>
  );
}
