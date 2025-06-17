import { AppSidebar } from "./components/Sidebar";
import Footer from "../(root)/components/Footer";
import Navigation from "../(root)/components/Navigation";
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function LayoutCustomer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="min-h-screen bg-[#F5F5F5] overflow-y-scroll ">
        <div className="fixed top-0 left-0 right-0 bg-black h-20 w-full z-50">
          <Navigation />
        </div>
        <div className="flex flex-1 w-full pt-16 justify-center">
          <div className="w-[80%] flex mt-12  mb-5 mx-auto justify-center">
            <SidebarProvider className="flex gap-5">
              <div className="relative w-64 rounded-lg">
                <AppSidebar />
              </div>
              <div className="flex-1 bg-white">{children}</div>
            </SidebarProvider>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
