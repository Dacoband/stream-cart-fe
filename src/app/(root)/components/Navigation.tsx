"use client";
import * as React from "react";
import Link from "next/link";
import { NavigationMenu } from "@/components/ui/navigation-menu";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { User } from "lucide-react";

export function Navigation() {
  const [user, setUser] = useState<{ username: string; role: string } | null>(
    null
  );

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.role) setUser(parsed);
    }
  }, []);

  return (
    <NavigationMenu className="w-full max-w-none h-full px-32 flex items-center justify-between">
      <div className="flex gap-2 items-center">
        <Link
          href="/home"
          className="flex items-center justify-center flex-row 
             hover:text-[#B0F847] hover:bg-black 
             active:bg-black active:text-[#B0F847] 
             focus:bg-black focus:text-[#B0F847] 
              px-2 py-1 rounded-md"
        >
          <Image
            src="/logo2 .png"
            alt="Stream Card Logo"
            width={96}
            height={96}
            className="w-14 h-14 object-contain"
          />
          <div className="text-3xl text-[#B0F847] font-semibold font-sans">
            Stream Cart
          </div>
        </Link>

        <div className="flex items-center gap-2 ml-8">
          <div className="relative">
            <Input
              type="text"
              placeholder="Tìm kiếm sản phẩm, cửa hàng..."
              className=" pr-4 py-5 w-2xl rounded-md bg-white text-slate-500 text-lg font-medium placeholder:text-gray-400"
            />
            <div className="absolute bg-gradient-to-r from-[#B0F847]  via-[#c6ef88]  to-[#B0F847] py-1.5 rounded-sm px-2.5 right-1.5 top-1/2 -translate-y-1/2 cursor-pointer">
              <Search className="text-white " />
            </div>
            {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /> */}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end h-full px-8">
        {user ? (
          <div className="flex items-center gap-2">
            <User className="w-7 h-7 text-[#B0F847]" />
            <span className="text-white">{user.username}</span>
          </div>
        ) : (
          <Link href="/authentication">
            <Button className="bg-gradient-to-r from-[#B0F847]  via-[#c6ef88]  to-[#B0F847] cursor-pointer text-black">
              Đăng nhập
            </Button>
          </Link>
        )}
      </div>
    </NavigationMenu>
  );
}

export default Navigation;
