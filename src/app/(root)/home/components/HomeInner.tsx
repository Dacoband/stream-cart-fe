"use client";

import { useState } from "react";
import ChatBot from "../../components/ChatBot";
import ChatWithShop from "../../components/ChatWithShop";
import Advertisement from "./advertisement";
import CategoryComponent from "./Category";
import FlashSale from "./FlashSale";
import LiveStreaming from "./LiveStreaming";
import RecommendedProducts from "./RecommendedProducts";

export default function HomeInner() {
  const [openBot, setOpenBot] = useState(false);
  const [openShop, setOpenShop] = useState(false);

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
      <ChatWithShop open={openShop} setOpen={handleOpenShop} shopId="" />
    </div>
  );
}
