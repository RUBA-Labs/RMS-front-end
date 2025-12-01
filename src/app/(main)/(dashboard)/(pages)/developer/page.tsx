import { DashboardPageProviders } from "../../providers/DashboardPageProviders"

//tabs
import { Overview } from "./TabContents/Overview";
import { DatabaseTest } from "./TabContents/DatabaseTest";
import { Sessions } from "./TabContents/Sessions";


export default function Developer() {
   const menuItemsDeveloper = [
    { title: "Overview", url: "#", icon: "Overview", content: "Overview" },
    //{ title: "Database Test", url: "#", icon: "NewClaim", content: "Database Test" },
    //{ title: "Sessions", url: "#", icon: "Scheduling", content: "Sessions" },
  ];

  return (
    <DashboardPageProviders menuItems={menuItemsDeveloper}>
      <div title="Overview"><Overview /></div>
      <div title="Database Test"><DatabaseTest /></div>
      <div title="Sessions"><Sessions /></div>


    </DashboardPageProviders>
  );
}
