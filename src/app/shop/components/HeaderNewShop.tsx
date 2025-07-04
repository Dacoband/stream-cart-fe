"use client";
import * as React from "react";
import {
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Image from "next/image";
import { CircleArrowOutDownRight, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { NavigationMenu } from "@radix-ui/react-navigation-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/AuthContext";
export function HeaderNewShop() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    router.push("/home");
  };

  return (
    <NavigationMenu className="w-full bg-[#202328] max-w-none h-full px-32 flex items-center justify-between">
      <div className="flex gap-2 items-center">
        <div
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
            className="w-14 h-14 object-contain"
          />
          <div className="text-3xl text-[#B0F847] font-semibold font-sans">
            Stream Cart
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end h-full">
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
                <div className="text-white font-semibold">Quản lý:</div>
                <span className="text-slate-200 truncate">
                  {user?.username}
                </span>
              </NavigationMenuTrigger>

              <NavigationMenuContent className="mt-16 py-2 rounded-md bg-white text-black shadow-xl">
                <ul className="grid w-[200px] gap-4">
                  <li>
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

export default HeaderNewShop;
