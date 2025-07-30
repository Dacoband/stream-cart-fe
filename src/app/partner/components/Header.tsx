"use client";
import { Button } from "@/components/ui/button";

import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Bell,
  CircleArrowOutDownRight,
  MessageCircleMore,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import {
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { NavigationMenu } from "@radix-ui/react-navigation-menu";
function Header() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    router.push("/authentication/login");
  };
  return (
    <NavigationMenu className="py-1.5 bg-[#202328] h-full flex justify-between items-center">
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
      <div className="text-white pr-5 flex gap-5 items-center">
        <div className=" pr-5 gap-5 flex border-r ">
          <Button className="w-10 h-10 flex items-center text-2xl cursor-pointer text-[#B0F847] justify-center rounded-full bg-[#34373b] hover:bg-[#B0F847] hover:text-black pr-4">
            <Bell className="min-w-[25px] min-h-[25px]" />
          </Button>
          <Button className="w-10 h-10 flex items-center text-2xl cursor-pointer text-[#B0F847] justify-center rounded-full bg-[#34373b] hover:bg-[#B0F847] hover:text-black pr-4">
            <MessageCircleMore className="min-w-[25px] min-h-[25px]" />
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-4 w-[120px]" />
            </div>
          </div>
        ) : (
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className="bg-[#202328] text-slate-200 
  hover:bg-[#202328] focus:bg-[#202328] active:bg-[#202328] 
  focus:text-slate-200 active:text-slate-200 
  ring-0 shadow-none border-none cursor-pointer
  flex items-center gap-2  h-fit"
              >
                {user?.avatarURL ? (
                  <Image
                    src={user.avatarURL}
                    alt="Avatar"
                    width={44}
                    height={44}
                    className="w-10 h-10 object-cover rounded-full shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#34373b] flex items-center justify-center text-[#B0F847] ">
                    <UserRound size={25} />
                  </div>
                )}
                <div className="text-white font-semibold">Nhân viên:</div>
                <span className="text-slate-200 truncate">
                  {user?.username}
                </span>
              </NavigationMenuTrigger>

              <NavigationMenuContent className="mt-16 py-2 rounded-md bg-white text-black shadow-xl">
                <ul className="grid w-[200px] gap-4">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/home"
                        className="flex-row items-center gap-2"
                        onClick={handleLogout}
                      >
                        <CircleArrowOutDownRight />
                        Đăng xuất
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        )}
      </div>
    </NavigationMenu>
  );
}

export default Header;
