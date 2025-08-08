import React from "react";
import HeaderNewShop from "../components/HeaderNewShop";

export default async function LayoutRegisterShop({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="fixed top-0 w-full z-50 h-[8vh]">
        <HeaderNewShop />
      </div>
      <div className="w-full mx-auto pt-[8vh] ">{children}</div>
    </div>
  );
}
