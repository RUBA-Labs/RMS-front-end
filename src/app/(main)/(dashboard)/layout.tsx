import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./components/app-sidebar"
import { DashboardHeader } from "./components/DashboardHeader"



export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <main className="flex-1 flex flex-col min-h-screen p-4 md:p-6 lg:p-10">
        

        <DashboardHeader />
        {children}
      </main>
    </SidebarProvider>
  )
}