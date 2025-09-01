"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  Bell,
  MessageCircleMore,
  ShoppingCart,
  UserRound,
  CircleUser,
  ScrollText,
  CircleArrowOutDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import { toast } from "sonner";
import SearchBar from "./SearchBar";
import NotificationDropDown from "./NotificationDropDown";
import { useNotificationStore } from "@/lib/notificationStore";

export default function Navbar() {
  const unreadNoti = useNotificationStore(
    (s: { unreadCount: number }) => s.unreadCount
  );
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { cartCount, resetCart } = useCart();

  const handleLogout = () => {
    logout();
    resetCart();
  };

  const handleRequireLogin = (redirectUrl: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập.");
      router.push(
        `/authentication/login?redirect=${encodeURIComponent(pathname)}`
      );
      return false;
    }
    router.push(redirectUrl);
    return true;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#202328] shadow">
      <div className="mx-auto max-w-screen-2xl h-16 px-6 md:px-8 flex items-center justify-between">
        {/* Left: logo + search */}
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/home" className="flex items-center gap-2">
            <Image
              src="/logo2.png"
              alt="Stream Cart Logo"
              width={40}
              height={40}
              priority
              className="object-contain"
            />
            <span className="text-xl text-[#B0F847] font-semibold">
              Stream Cart
            </span>
          </Link>
          <div className="hidden md:block min-w-[280px] lg:min-w-[420px]">
            <SearchBar />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {/* Search on small screens */}
          <div className="md:hidden">
            <SearchBar />
          </div>

          {/* Cart */}
          <Button
            onClick={() => handleRequireLogin("/customer/cart")}
            className="relative w-10 h-10 flex items-center justify-center text-[#B0F847] bg-[#34373b] hover:bg-[#B0F847] hover:text-black rounded-full"
          >
            <ShoppingCart className="min-w-[22px] min-h-[22px]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-[#B0F847] text-black text-[12px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-[4px] font-bold leading-none shadow-md">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Button>

          {/* Notifications */}
          <NotificationDropDown>
            <Button className="relative w-10 h-10 flex items-center justify-center text-[#B0F847] bg-[#34373b] hover:bg-[#B0F847] hover:text-black rounded-full">
              <Bell className="min-w-[22px] min-h-[22px]" />
              {unreadNoti > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-[#B0F847] text-black text-[12px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-[4px] font-bold leading-none shadow-md">
                  {unreadNoti > 99 ? "99+" : unreadNoti}
                </span>
              )}
            </Button>
          </NotificationDropDown>

          {/* Messages */}
          <Button
            onClick={() => handleRequireLogin("/messages")}
            className="w-10 h-10 flex items-center justify-center text-[#B0F847] bg-[#34373b] hover:bg-[#B0F847] hover:text-black rounded-full"
          >
            <MessageCircleMore className="min-w-[22px] min-h-[22px]" />
          </Button>

          {/* Auth */}
          {loading ? (
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          ) : !user ? (
            <Link
              href={`/authentication/login?redirect=${encodeURIComponent(
                pathname
              )}`}
            >
              <Button className="ml-2 bg-gradient-to-r from-[#B0F847] via-[#c6ef88] to-[#B0F847] text-black">
                Đăng nhập
              </Button>
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 cursor-pointer bg-transparent text-slate-200"
                  aria-label="Mở menu người dùng"
                >
                  {user.avatarURL ? (
                    <Image
                      src={user.avatarURL}
                      alt="Avatar"
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#34373b] flex items-center justify-center text-[#B0F847]">
                      <UserRound size={22} />
                    </div>
                  )}
                  <span className="truncate max-w-[140px]">
                    {user.username}
                  </span>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-56 bg-white text-black rounded-md shadow-xl"
              >
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link
                    href="/customer/profile"
                    className="flex items-center gap-2"
                  >
                    <CircleUser className="w-4 h-4" /> Hồ sơ cá nhân
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link
                    href="/customer/manage-orders"
                    className="flex items-center gap-2"
                  >
                    <ScrollText className="w-4 h-4" /> Đơn hàng
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <CircleArrowOutDownRight className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
