import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./components/app-sidebar"
import { DashboardHeader } from "./components/DashboardHeader"
import { MainArea } from "./components/main-container"
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"

// //mens import area 
// import { menuItemsAcademic } from "./(pages)/academic/sidebarLists"
// import { menuItemsAdmin } from "./(pages)/admin/sidebarLists"


const menuItemsAcademic = [
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

export default function Layout({ children }: { children: React.ReactNode }) {
  console.log(children)
  return (
    <> {children} </>
        
  )
}