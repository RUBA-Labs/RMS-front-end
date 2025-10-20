import { DashboardPageProviders } from "../../providers/DashboardPageProviders"

//tabs
import { Home } from "./TabContents/Home";
import { Inbox } from "./TabContents/Inbox";
import { Timetable } from "./TabContents/Timetable";
import { ExamClaims } from "./TabContents/ExamClaims";


export default function Academic() {
   const menuItemsAcademic = [
    { title: "Home", url: "#", icon: "Home", content: "Home" },
    { title: "Inbox", url: "#", icon: "Inbox", content: "Inbox" },
    { title: "Timetable", url: "#", icon: "Calendar", content: "Timetable" },
    { title: "Exam Claims", url: "#", icon: "ExamClaims", content: "ExamClaims" }
  ];

  return (
    <DashboardPageProviders menuItems={menuItemsAcademic}>
      <div title="Home"><Home /></div>
      <div title="Inbox"><Inbox /></div>
      <div title="Timetable"><Timetable /></div>
      <div title="Exam Claims"><ExamClaims /></div> 

    </DashboardPageProviders>
  );
}
