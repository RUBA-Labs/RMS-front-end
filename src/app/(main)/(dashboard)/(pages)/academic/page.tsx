import { DashboardPageProviders } from "../../providers/DashboardPageProviders"
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"

export default function Academic() {

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


  return (
    <DashboardPageProviders menuItems={menuItemsAcademic}>
      hello wold

      
    </DashboardPageProviders>

  );
}