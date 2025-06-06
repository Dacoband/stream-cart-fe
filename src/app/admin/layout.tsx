import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/Sidebar";
import Header from "./components/Header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full flex flex-col">
      {/* Header cố định */}
      <div className="fixed top-0 left-0 right-0 bg-black h-16 w-full z-50">
        <Header />
      </div>

      {/* Thêm padding-top để tránh bị header che */}
      <SidebarProvider className="flex-1 w-full pt-16">
        <div className="flex flex-1 w-full">
          <AppSidebar />
          <div className="flex-1 bg-[#EBECEA]">{children}</div>
        </div>
      </SidebarProvider>
    </div>
  );
}
