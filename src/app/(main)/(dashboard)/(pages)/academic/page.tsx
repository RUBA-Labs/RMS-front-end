import { DashboardPageProviders } from "../../providers/DashboardPageProviders"

//tabs
import { Home } from "./TabContents/Home";
import { MessageBox } from "./TabContents/MessageBox";
import  Timetable  from "./TabContents/AcademicTimetable";
import { ExamClaims } from "./TabContents/ExamClaims";


export default function Academic() {
   const menuItemsAcademic = [
    { title: "Home", url: "#", icon: "Home", content: "Home" },
    { title: "MessageBox", url: "#", icon: "Inbox", content: "MessageBox" },
    { title: "Timetable", url: "#", icon: "Calendar", content: "Timetable" },
    { title: "Exam Claims", url: "#", icon: "NewClaim", content: "ExamClaims" }
  ];

  return (
    <DashboardPageProviders menuItems={menuItemsAcademic}>
      <div title="Home"><Home /></div>
      <div title="MessageBox"><MessageBox /></div>
      <div title="Timetable"><Timetable /></div>
      <div title="Exam Claims"><ExamClaims /></div> 

    </DashboardPageProviders>
  );
}
