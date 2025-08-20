import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "../components/app-sidebar"
import { DashboardHeader } from "../components/DashboardHeader"
import { MainArea } from "../components/main-container"

import { DashboardPageProvidersProps } from "@/types/DashboardPageProvidersProps"; 

// interface SidebarItem {
//   title: string;
//   url: string;
//   icon: React.ElementType; // The icon prop is a React component
// }

// interface DashboardPageProvidersProps {
//   children: React.ReactNode;
//   menuItems: SidebarItem[];
// }

export function DashboardPageProviders({ children, menuItems }: DashboardPageProvidersProps) {
    return (
    <SidebarProvider>
      <AppSidebar items={menuItems} />
      <SidebarTrigger />
      <main className="flex-1 flex flex-col min-h-screen p-4 md:p-6 lg:p-10">
        <DashboardHeader />
        <MainArea>
          {children}
        </MainArea>
      </main>
    </SidebarProvider>
    );
}