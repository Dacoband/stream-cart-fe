// import React from "react";
// import { SidebarProvider } from "@/components/ui/sidebar";
// import { AppSidebar } from "./components/Sidebar";
import Header from "./components/Header";

// export default function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <SidebarProvider >
//

//       {/* Thêm padding-top để tránh bị header che */}
//
//         <div className="flex flex-1 w-full">
//           <AppSidebar />
//           <div className="flex-1 px-8 py-8 bg-[#EBECEA]">{children}</div>
//         </div>
//       </div>
//     </SidebarProvider>
//   );
// }
import { cookies } from "next/headers";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/Sidebar";

export default async function Layout({
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
      <div className="fixed top-0 left-0 right-0 bg-black h-16 w-full z-50">
        <Header />
      </div>
      <div className="flex flex-1 w-full pt-16">
        <AppSidebar />
        <div className="flex-1 px-8 py-8 bg-[#EBECEA]">{children}</div>
      </div>
    </SidebarProvider>
  );
}
