import { DashboardPageProviders } from "../../providers/DashboardPageProviders"

//tabs
import { Home } from "./TabContents/Home";
import { Inbox } from "./TabContents/Inbox";


export default function Academic() {
   const menuItemsAcademic = [
    { title: "Home", url: "#", icon: "Home", content: "Home" },
    { title: "Inbox", url: "#", icon: "Inbox", content: "Inbox" },
  ];

  return (
    <DashboardPageProviders menuItems={menuItemsAcademic}>
      <div title="Home"><Home /></div>
      <div title="Inbox"><Inbox /></div>


    </DashboardPageProviders>
  );
}
