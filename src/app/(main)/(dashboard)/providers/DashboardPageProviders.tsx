"use client"
import { useState, isValidElement } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/app-sidebar";
import { DashboardHeader } from "../components/DashboardHeader";
import { MainArea } from "../components/main-container";
import { DashboardPageProvidersProps, SidebarItem } from "@/types/DashboardPageProvidersProps";
import { Calendar, Home, Inbox, Search, Settings ,LayoutGrid ,Users} from "lucide-react";



// Create a mapping of icon names to components
const iconMap = {
  Home: Home,
  Inbox: Inbox,
  Calendar: Calendar,
  Search: Search,
  Settings: Settings,
  Users:Users ,
  Overview :LayoutGrid,
};

// Define the type for the props of the child components
interface ChildPropsWithTitle {
  title?: string;
}

export function DashboardPageProviders({ children, menuItems }: DashboardPageProvidersProps) {
  // Use state to track the active menu item by its title
  const [activeItemTitle, setActiveItemTitle] = useState<string | null>(menuItems[0]?.title || null);

  const handleMenuItemClick = (item: SidebarItem) => {
    setActiveItemTitle(item.title);
  };

  // Find the child component that matches the active menu item title
  const activeContent = Array.isArray(children)
    ? children.find((child) => {
        // Use isValidElement with the correct generic type
        if (isValidElement<ChildPropsWithTitle>(child)) {
          return child.props.title === activeItemTitle;
        }
        return false;
      })
    : children;

  return (
    <SidebarProvider>
      <AppSidebar items={menuItems} iconMap={iconMap} onMenuItemClick={handleMenuItemClick} />
      
      <main className="flex-1 flex flex-col min-h-screen p-4 md:p-6 lg:p-10">
        <DashboardHeader />
        <MainArea>
          {activeContent}
        </MainArea>
      </main>
    </SidebarProvider>
  );
}