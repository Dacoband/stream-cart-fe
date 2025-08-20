"use client";

import { usePathname } from "next/navigation";
import {
  TicketPercent,
  PieChart,
  Package,
  Wallet,
  ScanBarcode,
  Video,
  UsersRound,
} from "lucide-react";
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
    title: "Thống kê",
    url: "/shop/dashboard",
    icon: PieChart,
  },
  {
    title: "Sản phẩm",
    url: "/shop/manager-products",
    icon: ScanBarcode,
  },
  {
    title: "Đơn hàng",
    url: "/shop/manage-orders",
    icon: Package,
  },

  {
    title: "Livestrems",
    url: "/shop/livestreams",
    icon: Video,
  },

  {
    title: "Voucher",
  url: "/shop/manager-vouchers",
    icon: TicketPercent,
  },

  {
    title: "Giao dịch",
    url: "/admin/transactions",
    icon: Wallet,
  },
  {
    title: "Nhân viên",
    url: "/shop/moderators",
    icon: UsersRound,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="icon"
      className="bg-[#202328] text-white pt-20 transition-all duration-200 w-64 data-[collapsible=icon]:w-16 overflow-hidden"
    >
      <SidebarContent className="bg-[#202328] text-white">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={
                      `active:bg-[#202328] active:text-[#B0F847] focus:bg-[#202328] focus:text-[#B0F847] ` +
                      (pathname.startsWith(item.url)
                        ? "bg-base text-black mx-auto "
                        : "text-white hover:bg-[#202328] hover:text-[#B0F847] mx-auto")
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
