"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  TicketPercent,
  PieChart,
  ShieldCheck,
  Package,
  Wallet,
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
    url: "/admin/dashboard",
    icon: PieChart,
  },
  {
    title: "Chính sách",
    url: "/admin/policy",
    icon: ShieldCheck,
  },
  {
    title: "Quản lý cửa hàng",
    url: "/admin/store",
    icon: Store,
  },
  {
    title: "Danh mục",
    url: "/admin/categories",
    icon: LayoutDashboard,
  },
  {
    title: "Voucher",
    url: "/admin/vouchers",
    icon: TicketPercent,
  },
  {
    title: "Đơn hoàn trả",
    url: "/admin/refunds",
    icon: Package,
  },
  {
    title: "Giao dịch",
    url: "/admin/transactions",
    icon: Wallet,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="icon"
      className="bg-[#202328] text-white pt-20 transition-all duration-300 w-64 data-[collapsible=icon]:w-16"
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
                      pathname === item.url
                        ? "bg-base text-black mx-auto "
                        : "text-white hover:bg-gray-800 hover:text-gray-400 mx-auto"
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
