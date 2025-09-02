import { title } from "process";
import { DashboardPageProviders } from "../../providers/DashboardPageProviders"

//tabs
import { Home } from "./TabContents/Home";
import { Inbox } from "./TabContents/Inbox";
import Profile from "@/app/(main)/profile/page";
import { url } from "inspector";
import { MySchedule } from "./TabContents/MySchedule";
import { Resources } from "./TabContents/Resources";



export default function Student() {
   const menuItemsStudent = [
    { title: "Home", url: "#", icon: "Home", content: "Home" },
    { title:"Profile" ,url:"#", icon:"Profile", content:<Profile/>},
    { title: "My Courses", url: "#", icon: "My Courses", content: "My Courses" },
    { title: "My Schedule", url: "#", icon: "My Schedule", content: "My Schedule" },
    { title: "Resources", url: "#", icon: "Resources", content: "Resources" },
  ];

  return (
    <DashboardPageProviders menuItems={menuItemsStudent}>
      <div title="Home"><Home /></div>
      <div title="Profile"><Profile/></div>"
      <div title="My Courses"><Inbox /></div>
      <div title="My Schedule"><MySchedule /></div>
      <div title="Resources"><Resources /></div>


    </DashboardPageProviders>
  );
}
