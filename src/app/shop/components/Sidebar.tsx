"use client";

import { usePathname } from "next/navigation";
import {
  Store,
  TicketPercent,
  PieChart,
  Package,
  Wallet,
  ScanBarcode,
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
    title: "Quản lí sản phẩm",
    url: "/shop/manager-products",
    icon: ScanBarcode,
  },
  {
    title: "Quản lí đơn hàng",
    url: "/shop/order",
    icon: Package,
  },

  {
    title: "Quản lý kho",
    url: "/shop/address",
    icon: Store,
  },

  {
    title: "Voucher",
    url: "/admin/vouchers",
    icon: TicketPercent,
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
