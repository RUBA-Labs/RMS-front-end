import { DashboardPageProviders } from "../../providers/DashboardPageProviders"

//tabs
import { Home } from "./TabContents/Home";
import { Inbox } from "./TabContents/Inbox";


export default function ExamClaimsAdmin() {
   const menuItemsExamClaimsAdmin = [
    { title: "Home", url: "#", icon: "Home", content: "Home" },
    { title: "Inbox", url: "#", icon: "Inbox", content: "Inbox" },
  ];

  return (
    <DashboardPageProviders menuItems={menuItemsExamClaimsAdmin}>
      <div title="Home"><Home /></div>
      <div title="Inbox"><Inbox /></div>


    </DashboardPageProviders>
  );
}
