"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, ChevronDown, MessageCircleMore } from "lucide-react";
import Image from "next/image";
import React from "react";

import { useRouter } from "next/navigation";
function Header() {
  const router = useRouter();
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault(); // ngăn chuyển trang tức thì
    localStorage.removeItem("token"); // hoặc localStorage.clear()
    router.push("/");
  };
  return (
    <div className="py-1.5 bg-[#202328] h-full flex justify-between items-center">
      <div className="flex w-64 h-full items-center justify-between pl-5">
        <div className=" flex justify-center items-center ">
          <Image
            src="/logo2 .png"
            alt="Stream Card Logo"
            width={96}
            height={96}
            className="w-11 h-11 object-contain"
          />
          <div className="text-2xl text-[#B0F847] font-semibold font-sans">
            Stream Cart
          </div>
        </div>

        <SidebarTrigger className="  border-none hover:bg-[#202328] hover:text-white cursor-pointer rounded-lg text-2xl text-white" />
      </div>
      <div className="text-white pr-5 flex gap-5 ">
        <Button className="w-10 h-10 flex items-center text-2xl cursor-pointer justify-center rounded-full bg-[#34373b] hover:bg-[#B0F847] hover:text-black">
          <Bell className="min-w-[25px] min-h-[25px]" />
        </Button>
        <Button className="w-10 h-10 flex items-center text-2xl cursor-pointer justify-center rounded-full bg-[#34373b] hover:bg-[#B0F847] hover:text-black pr-4">
          <MessageCircleMore className="min-w-[25px] min-h-[25px]" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-[#202328] cursor-pointer rounded-none p-0 flex pl-5 border-white border-l-1">
              <Image
                src="https://i.pinimg.com/736x/8b/8a/ed/8b8aed24d96cefbf7b339b3e5e23bf7e.jpg"
                alt="Stream Card AvatarAvatar"
                width={44}
                height={44}
                className="w-10 h-10 object-cover rounded-full"
              />
              <div>Nhân viên cửa hàng:</div>
              <span className="text-slate-200"> TAT TAT TAT</span>

              <div className="text-white mx-1.5">
                <ChevronDown />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52 mt-2 " align="start">
            {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer">
                Profile
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              Log out
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default Header;
