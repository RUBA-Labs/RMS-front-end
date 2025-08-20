"use client";

import * as React from "react";
import { ModeToggle } from "@/components/ModeToggle";
import { LucideProps } from "lucide-react";
import { SidebarItem } from "@/types/DashboardPageProvidersProps";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Define the props for the AppSidebar component, including the new props
interface AppSidebarProps {
  items: SidebarItem[];
  // Fix the type to accept a full SidebarItem object
  onMenuItemClick: (item: SidebarItem) => void;
  iconMap: { [key: string]: React.ForwardRefExoticComponent<React.PropsWithoutRef<LucideProps> & React.RefAttributes<SVGSVGElement>> };
}

// Update the component to accept all the required props
export function AppSidebar({ items, onMenuItemClick, iconMap }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between my-4 mt-8 " >
            <h1 className="text-lg font-medium">Dashboard</h1>
            <ModeToggle />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const IconComponent = typeof item.icon === "string" 
                  ? iconMap[item.icon] 
                  : item.icon;
                  
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      {/* Pass the entire 'item' object in the onClick handler */}
                      <a href={item.url} onClick={() => onMenuItemClick(item)}>
                        {IconComponent && <IconComponent />}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
