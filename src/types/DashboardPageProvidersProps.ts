import { SidebarItem } from "./SidebarItem";

/**
 * Defines the props for the DashboardPageProviders component.
 * It specifies the expected types for children and the menu items.
 */
export interface DashboardPageProvidersProps {
    children: React.ReactNode;
    menuItems: SidebarItem[];
}
