"use client";

import * as React from "react";
// Import hooks, the getUserData function, and the User type
import { useState, useEffect } from "react";
import { getUserData, User } from "@/services/api/UserProfile/getUserData"; // Adjust path as needed
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignOut } from "./SignOut";

// Define the props for the AppSidebar component
interface AppSidebarProps {
  items: SidebarItem[];
  onMenuItemClick: (item: SidebarItem) => void;
  iconMap: {
    [key: string]: React.ForwardRefExoticComponent<
      React.PropsWithoutRef<LucideProps> & React.RefAttributes<SVGSVGElement>
    >;
  };
}

export function AppSidebar({
  items,
  onMenuItemClick,
  iconMap,
}: AppSidebarProps) {
  // State for holding user data and loading status
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserData();
        setUser(userData);
      } catch (err) {
        setError((err as Error).message);
        console.error("Failed to fetch user in sidebar:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []); // Empty array ensures this runs only once

  // Helper function to determine display name
  const getUserDisplayName = () => {
    if (isLoading) {
      return "Loading...";
    }
    if (error) {
      return "User"; // Fallback on error
    }
    // Use fullName, or fall back to email, or "User"
    return user?.fullName || user?.email || "User";
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between my-4 mt-8 ">
            <h1 className="text-lg font-medium">Dashboard</h1>
            <ModeToggle />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const IconComponent =
                  typeof item.icon === "string"
                    ? iconMap[item.icon]
                    : item.icon;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
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
      <SidebarFooter className="mb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 />
                  {/* Display the fetched name */}
                  <span className="ml-2 truncate">{getUserDisplayName()}</span>
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
                  <User2 className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <SignOut />
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}