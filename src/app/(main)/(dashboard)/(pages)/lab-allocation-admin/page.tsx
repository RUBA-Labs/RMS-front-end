import { DashboardPageProviders } from "../../providers/DashboardPageProviders"


//tabs
import { Overview } from "../lab-allocation-admin/TabContents/Overview";
import { Inbox } from "./TabContents/Inbox";


export default function LabAllocationAdmin() {
   const menuItemsLabAllocationAdmin = [
    { title: "Overview", url: "#", icon: "Overview", content: "Overview" },
    { title: "Inbox", url: "#", icon: "Inbox", content: "Inbox" },
  ];

  return (
    <DashboardPageProviders menuItems={menuItemsLabAllocationAdmin}>
      <div title="Overview"><Overview /></div>
      <div title="Inbox"><Inbox /></div>


    </DashboardPageProviders>
  );
}
