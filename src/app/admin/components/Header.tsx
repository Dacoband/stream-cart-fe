import Image from "next/image";
import React from "react";

function Header() {
  return (
    <div className="py-1.5 bg-[#202328] h-full">
      <div className="flex h-full items-center">
        <div className="w-20 flex justify-center ">
          <Image
            src="/logo2 .png"
            alt="Stream Card Logo"
            width={96}
            height={96}
            className="w-12 h-12 object-contain"
          />
        </div>
        <div className="text-2xl text-[#B0F847] font-semibold font-sans">
          Stream Cart
        </div>
      </div>
    </div>
  );
}

export default Header;
