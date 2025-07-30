"use client";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

import { NavigationMenu } from "@radix-ui/react-navigation-menu";
import { useAuth } from "@/lib/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export function Navigation() {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/home");
    }
  }, [loading, user, router]);

  return (
    <NavigationMenu className="w-full bg-[#202328] shadow max-w-none h-full px-32 flex items-center justify-between">
      <div className="flex items-center">
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
            className="w-12 h-12 object-contain"
          />
          <div className="text-2xl text-[#B0F847] font-semibold ml-2">
            Stream Cart
          </div>
        </Link>

        <div>
          <h4 className="text-2xl font-semibold border-l border-white ml-2 pl-2.5 text-white">
            Thanh Toán
          </h4>
        </div>
      </div>

      <div>
        {loading ? (
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-4 w-[120px]" />
            </div>
          </div>
        ) : user ? (
          <div className="flex items-center space-x-2">
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
          </div>
        ) : null}
      </div>
    </NavigationMenu>
  );
}

export default Navigation;
