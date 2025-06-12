"use client";
import * as React from "react";
import Link from "next/link";
import { NavigationMenu } from "@/components/ui/navigation-menu";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import {
  Bell,
  ChevronDown,
  MessageCircleMore,
  Search,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { useRouter } from "next/navigation";
// import { Skeleton } from "@/components/ui/skeleton";

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
  const router = useRouter();
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.clear();
    router.push("/home");
    window.location.reload();
  };
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
            <div className="absolute bg-gradient-to-r from-[#B0F847]  via-[#c6ef88]  to-[#B0F847] py-1.5 rounded-sm px-3.5 right-1.5 top-1/2 -translate-y-1/2 cursor-pointer">
              <Search className="text-black " />
            </div>
            {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /> */}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end h-full px-8">
        {user === null ? (
          <Link href="/authentication">
            <Button className="bg-gradient-to-r from-[#B0F847]  via-[#c6ef88]  to-[#B0F847] cursor-pointer text-black">
              Đăng nhập
            </Button>
          </Link>
        ) : // <div className="flex items-center space-x-4">
        //   <Skeleton className="h-12 w-12 rounded-full" />
        //   <div className="space-y-2">
        //     <Skeleton className="h-4 w-[250px]" />
        //     <Skeleton className="h-4 w-[200px]" />
        //   </div>
        // </div>
        user ? (
          <div className="flex ">
            <div className=" pr-5 flex gap-5 ">
              <Button className="w-10 h-10 flex items-center text-2xl cursor-pointer text-[#B0F847] justify-center rounded-full bg-[#34373b] hover:bg-[#B0F847] hover:text-black pr-4">
                <ShoppingCart className="min-w-[25px] min-h-[25px] " />
              </Button>
              <Button className="w-10 h-10 flex items-center text-2xl cursor-pointer justify-center text-[#B0F847] rounded-full bg-[#34373b] hover:bg-[#B0F847] hover:text-black">
                <Bell className="min-w-[25px] min-h-[25px] " />
              </Button>
              <Button className="w-10 h-10 flex items-center text-2xl cursor-pointer text-[#B0F847] justify-center rounded-full bg-[#34373b] hover:bg-[#B0F847] hover:text-black pr-4">
                <MessageCircleMore className="min-w-[25px] min-h-[25px] " />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-black cursor-pointer rounded-none p-0 flex pl-5 border-white border-l-1">
                    <Image
                      src="https://i.pinimg.com/736x/8b/8a/ed/8b8aed24d96cefbf7b339b3e5e23bf7e.jpg"
                      alt="Stream Card AvatarAvatar"
                      width={44}
                      height={44}
                      className="w-10 h-10 object-cover rounded-full"
                    />

                    <span className="text-slate-200"> TAT TAT TAT</span>

                    <div className="text-white mx-1.5">
                      <ChevronDown />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  style={{
                    boxShadow: "0 0 20px rgba(148, 163, 184, 0.4)",
                  }}
                  className="w-52 mt-5 text-white px-4 py-2.5 rounded-2xl bg-black "
                  align="start"
                >
                  {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="cursor-pointer py-1.5 border-b-[1px] border-slate-300 flex gap-2">
                      <User /> Hồ sơ cá nhân
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer  py-1.5"
                  >
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
