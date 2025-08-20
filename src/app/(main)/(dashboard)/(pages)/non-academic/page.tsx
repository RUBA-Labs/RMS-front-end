import { DashboardPageProviders } from "../../providers/DashboardPageProviders"

//tabs
import { Home } from "./TabContents/Home";
import { Inbox } from "./TabContents/Inbox";


export default function NonAcademic() {
   const menuItemsNonAcademic = [
    { title: "Home", url: "#", icon: "Home", content: "Home" },
    { title: "Inbox", url: "#", icon: "Inbox", content: "Inbox" },
  ];

  return (
    <DashboardPageProviders menuItems={menuItemsNonAcademic}>
      <div title="Home"><Home /></div>
      <div title="Inbox"><Inbox /></div>


    </DashboardPageProviders>
  );
}
