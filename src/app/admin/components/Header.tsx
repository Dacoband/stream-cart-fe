import Image from "next/image";
import React from "react";

function Header() {
  return (
    <div className="">
      <div>
        <Image
          src="/logo2 .png"
          alt="Stream Card Logo"
          width={96}
          height={96}
          className="w-14 h-14 object-contain"
        />{" "}
        Stream Cart
      </div>
    </div>
  );
}

export default Header;
