import { DashboardPageProviders } from "../../providers/DashboardPageProviders"

//tabs
import { Overview } from "./TabContents/Overview";
import Users from "./TabContents/Users/Users";


export default function Admin() {
   const menuItemsAdmin = [
    { title: "Overview", url: "#", icon: "Overview", content: "Overview" },
    { title: "Users", url: "#", icon: "Users", content: "Users" },
  ];

  return (
    <DashboardPageProviders menuItems={menuItemsAdmin}>
      <div title="Overview"><Overview /></div>
      <div title="Users"><Users /></div>


    </DashboardPageProviders>
  );
}
