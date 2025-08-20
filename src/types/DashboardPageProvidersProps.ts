import { ElementType } from "react";

/**
 * Defines the structure for a single item in the sidebar menu.
 * This type is used to ensure consistency across the application.
 */
export interface SidebarItem {
    title: string;
    url: string;
    // The icon property can be either a string (for a lookup in a map) or a React component (ElementType).
    icon: string | ElementType;
    // The content property is an optional React component that will be rendered when the menu item is active.
    content:string| ElementType;
}

/**
 * Defines the props for the DashboardPageProviders component.
 * It specifies the expected types for children and the menu items.
 */
export interface DashboardPageProvidersProps {
    children: React.ReactNode;
    menuItems: SidebarItem[];
}
