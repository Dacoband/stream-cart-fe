import { SidebarProvider } from "@/components/ui/sidebar";

export default async function LayoutShopAccount({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-[#F5F5F5]">{children}</div>
    </SidebarProvider>
  );
}
