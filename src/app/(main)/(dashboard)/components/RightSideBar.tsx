import React from 'react';
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";
import { ReactNode } from 'react';

// --- Recreated UI Components with Tailwind CSS for Right Alignment ---

// Main sidebar container. The key here is 'right-0' to pin it to the right,
// and 'border-l' to add a border on the left side instead of the right.
const Sidebar = ({ children }: { children: ReactNode }) => {
  return (
    <div className="fixed top-0 right-0 h-full w-64 bg-white border-l border-gray-200 shadow-xl transform transition-transform duration-300 ease-in-out z-10">
      {children}
    </div>
  );
};

// The rest of the components from the original request are recreated here.
const SidebarContent = ({ children }: { children: ReactNode }) => {
  return (
    <div className="p-4 h-full flex flex-col">
      {children}
    </div>
  );
};

const SidebarGroup = ({ children, className }: { children: ReactNode, className?: string }) => {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
};

const SidebarGroupLabel = ({ children }: { children: ReactNode }) => {
  return (
    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
      {children}
    </div>
  );
};

const SidebarGroupContent = ({ children }: { children: ReactNode }) => {
  return <div>{children}</div>;
};

const SidebarMenu = ({ children }: { children: ReactNode }) => {
  return <ul className="space-y-1">{children}</ul>;
};

const SidebarMenuItem = ({ children }: { children: ReactNode }) => {
  return <li>{children}</li>;
};

const SidebarMenuButton = ({ children, asChild, className, ...props }: { children: ReactNode, asChild?: boolean, className?: string }) => {
  const baseClasses = "flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200 w-full text-left";
  
  if (asChild) {
    // Explicitly cast children to React.ReactElement to access props.
    const childElement = React.Children.only(children) as React.ReactElement<{ className?: string }>;
    const childClassName = childElement.props.className || '';
    const finalClassName = `${baseClasses} ${className || ''} ${childClassName}`.trim();

    return React.cloneElement(childElement, { className: finalClassName, ...props });
  }

  return (
    <button className={`${baseClasses} ${className || ''}`} {...props}>
      {children}
    </button>
  );
};

// Menu items.
const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export function AppSidebarRight() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

// Default export is required for React immersive.
export default AppSidebarRight;
