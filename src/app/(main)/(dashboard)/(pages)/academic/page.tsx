import { DashboardPageProviders } from "../../providers/DashboardPageProviders"

//tabs
import { Home } from "./TabContents/Home";
import { Inbox } from "./TabContents/Inbox";


export default function Academic() {
   const menuItemsAcademic = [
    { title: "Home", url: "#", icon: "Home", content: "Home" },
    { title: "Inbox", url: "#", icon: "Inbox", content: "Inbox" },
    { title: "Timetable", url: "#", icon: "Calendar", content: "Timetable" },
    { title: "Results", url: "#", icon: "ClipboardList", content: "Results" },
    { title: "Attendance", url: "#", icon: "CheckCircle", content: "Attendance" },
    { title: "Exams", url: "#", icon: "BookOpen", content: "Exams" },
    { title: "Academic Calendar", url: "#", icon: "CalendarDays", content: "Academic Calendar" }
  ];

  return (
    <DashboardPageProviders menuItems={menuItemsAcademic}>
      <div title="Home"><Home /></div>
      <div title="Inbox"><Inbox /></div>


    </DashboardPageProviders>
  );
}
