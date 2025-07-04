import Header from "../components/Header";

import { cookies } from "next/headers";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/Sidebar";

export default async function LayoutShop({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      className="h-screen w-full flex flex-col"
    >
      <div className="fixed top-0 left-0 right-0 bg-black h-20 w-full z-50">
        <Header />
      </div>
      <div className="flex flex-1 w-full pt-16 h-full min-h-0">
        <AppSidebar />
        <div className="flex-1 bg-[#F5F5F5] overflow-auto ">{children}</div>
      </div>
    </SidebarProvider>
  );
}
