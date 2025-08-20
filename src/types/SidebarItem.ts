import { ElementType } from "react";

export interface SidebarItem {
    title: string;
    url: string;
    // Update the 'icon' type to accept both string and ElementType
    icon: string | ElementType;
}
