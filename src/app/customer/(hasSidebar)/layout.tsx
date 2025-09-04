import { AppSidebar } from '../components/Sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
export default async function LayoutCustomerHasSicebar({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-[#F5F5F5] h-full">
      <div className="w-[80%] flex mx-auto pt-8">
        <SidebarProvider className="flex gap-8 items-start w-full">
          <div className="w-64 h-[calc(100vh-9rem)] rounded-lg sticky top-28">
            <AppSidebar />
          </div>

          <div className="flex-1 rounded-lg pb-5 min-h-screen">{children}</div>
        </SidebarProvider>
      </div>
    </div>
  )
}
