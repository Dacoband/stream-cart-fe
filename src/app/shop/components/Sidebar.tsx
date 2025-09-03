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
  Zap,
  Crown,
  Store,
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
import { useAuth } from "@/lib/AuthContext";
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
    title: "Flash Sale",
    url: "/shop/manager-flashSale",
    icon: Zap,
  },
  {
    title: "Voucher",
    url: "/shop/manager-vouchers",
    icon: TicketPercent,
  },

  {
    title: "Giao dịch",
    url: "/shop/manager-wallet",
    icon: Wallet,
  },
  {
    title: "Nhân viên",
    url: "/shop/moderators",
    icon: UsersRound,
  },
  {
    title: "Gói thành viên",
    url: "/shop/memberships",
    icon: Crown,
  },
  {
    title: "Gói của tôi",
    url: "/shop/my-membership",
    icon: Crown,
  },
  {
    title: "Cập nhật Shop",
    url: "/shop/profile-shop",
    icon: Store,
  },
  {
    title: "Cập nhật cá nhân",
    url: "/shop/my-profile",
    icon: UsersRound,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const visibleItems =
    user?.role === 3
      ? items.filter(
          (it) =>
            it.url !== "/shop/profile-shop" &&
            it.url !== "/shop/moderators" &&
            it.url !== "/shop/my-membership" &&
            it.url !== "/shop/memberships"
        )
      : items;

  return (
    <Sidebar
      collapsible="icon"
      className="bg-[#202328] text-white pt-20 transition-all duration-200 w-64 data-[collapsible=icon]:w-16 overflow-hidden"
    >
      <SidebarContent className="bg-[#202328] text-white">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
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
