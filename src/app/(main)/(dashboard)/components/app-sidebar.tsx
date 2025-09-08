"use client";

import * as React from "react";
import { ModeToggle } from "@/components/ModeToggle";
import { ChevronUp, LucideProps, User2 } from "lucide-react";
import { SidebarItem } from "@/types/SidebarItem";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SignOut } from "./SignOut";

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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> Username
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem
                  onClick={() => {
                    window.location.href = "/profile";
                  }}
                >
                  <span>Profile</span>
                </DropdownMenuItem>
                <SignOut/>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
