import Image from "next/image";
import React from "react";

function Advertisement() {
  return (
    <div className="flex justify-center gap-4 my-8">
      <Image
        src="/qc1.jpg"
        alt="Stream Card Logo"
        width={900}
        height={304}
        quality={100}
        className="w-1/2 h-[400px] object-cover rounded-md"
      />
      <div className="w-1/3 flex flex-col gap-4">
        <div className="bg-black h-[192px] w-full rounded-md"></div>
        <div className="bg-[#B0F847] h-[192px] w-full rounded-md"></div>
      </div>
    </div>
  );
}

export default Advertisement;
