"use client";
import * as React from "react";
import Link from "next/link";
import {
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Image from "next/image";
import {
  Bell,
  CircleArrowOutDownRight,
  CircleUser,
  ScrollText,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";

import { NavigationMenu } from "@radix-ui/react-navigation-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/AuthContext";
import SearchBar from "./SearchBar";
import { useCart } from "@/lib/CartContext";
export function Navigation() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { cartCount, resetCart } = useCart();
  const currentPath = pathname;
  const handleLogout = () => {
    logout();
    resetCart();
  };
  const handleClick = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Vui lòng đăng nhập.");
      router.push(
        `/authentication/login?redirect=${encodeURIComponent(currentPath)}`
      );
    } else {
    }
  };
  const handleClickCart = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Vui lòng đăng nhập.");
      router.push(
        `/authentication/login?redirect=${encodeURIComponent(currentPath)}`
      );
    } else {
      router.push(`/customer/cart`);
    }
  };

  return (
    <NavigationMenu className="w-full bg-[#202328] shadow max-w-none h-full px-32 flex items-center justify-between">
      <div className="flex gap-2 items-center">
        <Link
          href="/home"
          className="flex items-center justify-center flex-row 
             hover:text-[#B0F847] hover:bg-[#202328]
             active:bg-[#202328] active:text-[#B0F847] 
             focus:bg-[#202328] focus:text-[#B0F847] 
              px-2 py-1 rounded-md"
        >
          <Image
            src="/logo2 .png"
            alt="Stream Card Logo"
            width={96}
            height={96}
            priority
            className="w-11 h-11 object-contain"
          />
          <div className="text-xl text-[#B0F847] font-semibold font-sans">
            Stream Cart
          </div>
        </Link>
        <SearchBar />
      </div>
      <div className="flex items-center justify-end h-full">
        <div className=" pr-5 gap-5 flex border-r ">
          <Button
            onClick={handleClickCart}
            className="relative w-10 h-10 flex items-center justify-center cursor-pointer text-[#B0F847] bg-[#34373b] hover:bg-[#B0F847] hover:text-black rounded-full"
          >
            <ShoppingCart className="min-w-[25px] min-h-[25px]" />

            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-[#B0F847] text-black text-[12.5px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-[4px] font-bold leading-none shadow-md">
                {cartCount}
              </span>
            )}
          </Button>
          <Button
            onClick={handleClick}
            className="w-10 h-10 flex items-center text-2xl cursor-pointer justify-center text-[#B0F847] rounded-full bg-[#34373b] hover:bg-[#B0F847] hover:text-black"
          >
            <Bell className="min-w-[25px] min-h-[25px] " />
          </Button>
          {/* <Button
            onClick={handleClick}
            className="w-10 h-10  flex items-center text-2xl cursor-pointer text-[#B0F847] justify-center rounded-full bg-[#34373b] hover:bg-[#B0F847] hover:text-black pr-4"
          >
            <MessageCircleMore className="min-w-[25px] min-h-[25px] " />
          </Button> */}
        </div>
        {loading ? (
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        ) : !user ? (
          <Link
            href={`/authentication/login?redirect=${encodeURIComponent(
              pathname
            )}`}
          >
            <Button className="bg-gradient-to-r ml-10 from-[#B0F847]  via-[#c6ef88]  to-[#B0F847] cursor-pointer text-black">
              Đăng nhập
            </Button>
          </Link>
        ) : (
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className="bg-[#202328] text-slate-200 
  hover:bg-[#202328] focus:bg-[#202328] active:bg-[#202328] 
  focus:text-slate-200 active:text-slate-200 
  ring-0 shadow-none border-none cursor-pointer
  flex items-center gap-2 max-w-[200px] h-fit"
              >
                {user.avatarURL ? (
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
                <span className="text-slate-200 truncate">{user.username}</span>
              </NavigationMenuTrigger>

              <NavigationMenuContent className="mt-16 py-2 rounded-md bg-white text-black shadow-xl">
                <ul className="grid w-[200px] gap-4">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href={`/customer/profile`}
                        className="flex-row items-center gap-2"
                      >
                        <CircleUser />
                        Hồ sơ cá nhân
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href={`/customer/manage-orders`}
                        className="flex-row items-center gap-2"
                      >
                        <ScrollText />
                        Đơn hàng
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <div
                        className="flex-row items-center gap-2"
                        onClick={handleLogout}
                      >
                        <CircleArrowOutDownRight />
                        Đăng xuất
                      </div>
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

export default Navigation;
