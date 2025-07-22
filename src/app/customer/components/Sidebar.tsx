"use client";

import { usePathname } from "next/navigation";
import { CircleUser, ScrollText, Bell, UserRound } from "lucide-react";
import {
  SidebarContent,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/AuthContext";
import Image from "next/image";

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  if (!user) {
    return null;
  }

  const items = [
    {
      title: "Thông tin cá nhân",
      url: `/customer/profile/${user.id}`,
      icon: CircleUser,
    },
    {
      title: "Đơn hàng",
      url: "/customer/manage-orders",
      icon: ScrollText,
    },
    {
      title: "Thông báo",
      url: "/customer/notification",
      icon: Bell,
    },
  ];

  return (
    <SidebarContent
      className="bg-white text-black rounded-lg h-full p-4 "
      style={{
        boxShadow: "0 0 20px rgba(148, 163, 184, 0.3)",
      }}
    >
      <SidebarHeader className="border-b">
        <div className="flex flex-col gap-2 my-2 items-center">
          {user.avatarURL ? (
            <Image
              src={user.avatarURL}
              alt="Avatar"
              width={88}
              height={88}
              className="w-24 h-24 object-cover rounded-full shrink-0"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[#B0F847] text-fill flex items-center justify-center text-white border-2 border-[#B0F847]">
              <UserRound size={50} className=" text-white" />
            </div>
          )}

          <div className="font-semibold text-lg">{user.username}</div>
          {/* <span className="bg-purple-200 text-purple-700 px-4 py-1.5 rounded-full text-xs font-medium">
            Khách hàng
          </span> */}
          <span className="bg-purple-200 text-purple-700 px-4 py-1.5 rounded-full text-xs font-medium">
            Điểm thưởng: 0
          </span>
        </div>
      </SidebarHeader>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className={
                  pathname.startsWith(item.url)
                    ? "bg-[#B0F847]/40 text-[#65a406] mx-auto font-medium "
                    : "text-black hover:bg-gray-100  mx-auto"
                }
              >
                <a
                  href={item.url}
                  className="flex items-center gap-2 px-4 py-3 my-1  rounded transition-colors group-data-[collapsible=icon]:justify-center"
                >
                  <item.icon className="min-w-[22px] min-h-[22px]" />
                  <span className=" group-data-[collapsible=icon]:hidden">
                    {item.title}
                  </span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarContent>
  );
}
