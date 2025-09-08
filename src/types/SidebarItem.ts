import { ElementType, ReactNode } from "react";

export interface SidebarItem {
    title: string;
    url: string;
    icon: string | ElementType;
    content: ReactNode;
}