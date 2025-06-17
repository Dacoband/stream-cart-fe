"use client";

import { usePathname } from "next/navigation";
import { Store, PieChart, ShieldCheck } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  {
    title: "Thông tin cá nhân",
    url: "/customer/profile/1",
    icon: PieChart,
  },
  {
    title: "Đơn hàng",
    url: "/admin/policy",
    icon: ShieldCheck,
  },
  {
    title: "Thông báo",
    url: "/admin/store",
    icon: Store,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="!relative  bg-white border-2 h-[82vh] shadow-md rounded-lg text-black pt-20 transition-all duration-300 w-64">
      <SidebarContent className="bg-white text-black rounded-b-lg h-full">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={
                      pathname === item.url
                        ? "bg-base text-black mx-auto "
                        : "text-black hover:bg-gray-800 hover:text-gray-400 mx-auto"
                    }
                  >
                    <a
                      href={item.url}
                      className="flex items-center gap-2 px-4 py-3 my-1 text-base rounded transition-colors group-data-[collapsible=icon]:justify-center"
                    >
                      <item.icon className="min-w-[22px] min-h-[22px]" />
                      <span className="text-base group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
