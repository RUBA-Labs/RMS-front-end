import { DashboardPageProviders } from "../../providers/DashboardPageProviders"

//tabs
import { Home } from "./TabContents/Home";



export default function User() {
   const menuItemsUser = [
    { title: "Home", url: "#", icon: "Home", content: "Home" },
 
  ];

  return (
    <DashboardPageProviders menuItems={menuItemsUser}>
      <div title="Home"><Home /></div>



    </DashboardPageProviders>
  );
}
