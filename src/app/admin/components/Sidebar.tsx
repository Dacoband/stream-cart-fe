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
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  {
    title: "Thống kê",
    url: "/admin/dashboard",
    icon: PieChart,
  },
  {
    title: "Chính sách",
    url: "/admin/Policy",
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
  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="bg-[#202328] text-white pt-20">
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
      <SidebarFooter className="bg-[#202328] w-full border-none cursor-pointer rounded-none text-2xl">
        <SidebarMenu className="">
          <SidebarTrigger
            className="bg-[#202328] w-full border-none cursor-pointer rounded-lg text-2xl"
            onClick={toggleSidebar}
          />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
