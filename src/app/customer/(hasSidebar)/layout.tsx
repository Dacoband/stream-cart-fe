import { AppSidebar } from "../components/Sidebar";
import Footer from "../../(root)/components/Footer";
import { SidebarProvider } from "@/components/ui/sidebar";
export default async function LayoutCustomer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full bg-[#F5F5F5] h-full">
      <div className="w-[80%] flex mx-auto pt-8">
        <SidebarProvider className="flex gap-8 items-start w-full">
          <div className="w-64 h-[calc(100vh-9rem)] rounded-lg sticky top-28">
            <AppSidebar />
          </div>

          <div
            className="flex-1 sticky top-28 py-8 px-10 bg-white min-h-[calc(100vh-9rem)] rounded-lg "
            style={{
              boxShadow: "0 0 20px rgba(148, 163, 184, 0.3)",
            }}
          >
            {children}
          </div>
        </SidebarProvider>
      </div>
      <div className="mt-8">
        <Footer />
      </div>
    </div>
  );
}
