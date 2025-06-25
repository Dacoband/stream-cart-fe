import Header from "./components/Header";
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function LayoutShopAccount({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="h-screen w-full flex flex-col">
        <div className="fixed top-0 left-0 right-0 bg-black h-16 w-full z-50">
          <Header />
        </div>
        <div className="flex flex-1 w-full pt-16">
          <div className="flex-1 px-10 py-8 bg-[#fbfbfb]">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
}
