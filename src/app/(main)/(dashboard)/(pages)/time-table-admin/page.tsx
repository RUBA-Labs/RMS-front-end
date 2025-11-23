import { DashboardPageProviders } from "../../providers/DashboardPageProviders"

//tabs
import { Overview } from "./TabContents/Overview";
import { ClashReports } from "./TabContents/ClashReports";
import  Timetable  from "./TabContents/AdminTimetable";


export default function TimeTableAdmin() {
   const menuItemsTimeTableAdmin = [
    { title: "Overview", url: "#", icon: "Overview", content: "Overview" },
    { title: "Timetable", url: "#", icon: "Calendar", content: "Timetable" },
    { title: "ClashReports", url: "#", icon: "Inbox", content: "ClashReports" },
  ];

  return (
    <DashboardPageProviders menuItems={menuItemsTimeTableAdmin}>
      <div title="Overview"><Overview /></div>
      <div title="ClashReports"><ClashReports /></div>
      <div title="Timetable"><Timetable /></div>


    </DashboardPageProviders>
  );
}
