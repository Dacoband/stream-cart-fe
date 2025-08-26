"use client";

import { useState } from "react";
import ChatBot from "../components/ChatBot";
import ChatWithShop from "../components/ChatWithShop";
import Advertisement from "./components/advertisement";
import CategoryComponent from "./components/Category";
import FlashSale from "./components/FlashSale";
import LiveStreaming from "./components/LiveStreaming";
import RecommendedProducts from "./components/RecommendedProducts";

export default function Home() {
  const [openBot, setOpenBot] = useState(false);
  const [openShop, setOpenShop] = useState(false);

  // Khi mở cái này thì đóng cái kia
  const handleOpenBot = () => {
    setOpenBot((prev) => !prev);
    if (!openBot) setOpenShop(false);
  };
  const handleOpenShop = () => {
    setOpenShop((prev) => !prev);
    if (!openShop) setOpenBot(false);
  };

  return (
    <div className="flex flex-col w-[80%] mx-auto gap-5 mb-16 mt-2">
      <Advertisement />
      <CategoryComponent />
      <LiveStreaming />
      <FlashSale />
      <RecommendedProducts />

      <ChatBot open={openBot} setOpen={handleOpenBot} />
      <ChatWithShop open={openShop} setOpen={handleOpenShop} />
    </div>
  );
}
