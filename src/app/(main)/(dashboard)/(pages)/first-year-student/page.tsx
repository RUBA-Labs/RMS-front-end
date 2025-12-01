import { DashboardPageProviders } from "../../providers/DashboardPageProviders"

//tabs
import { Home } from "./TabContents/Home";
import Profile from "@/app/(main)/profile/page";
import { Resources } from "./TabContents/Resources";
import { LabBooking } from "./TabContents/LabBooking";
import  StudentTimetable  from "./TabContents/StudentTimetable";
import TimeTableClash from "./TabContents/TimeTableClash";

export default function Student() {
    const menuItemsStudent = [
        { title: "Home", url: "#", icon: "Home", content: "Home" },
        { title: "Timetable", url: "#", icon: "Calendar", content: "Timetable" },
        { title: "TimeTableClash", url: "#", icon: "NewClaim", content: "TimeTableClash" },
        { title: "Lab Reservation", url: "#", icon: "LabBooking", content: "Lab Booking" },
        //{ title: "Resources", url: "#", icon: "Boxes", content: "Resources" },
        
    ];

    return (
        <DashboardPageProviders menuItems={menuItemsStudent}>
            <div title="Home"><Home /></div>
            <div title="Profile"><Profile /></div>
            <div title="Resources"><Resources /></div>
            <div title="Timetable"><StudentTimetable /></div>
            <div title="TimeTableClash"><TimeTableClash /></div>
            <div title="Lab Reservation"><LabBooking /></div>
        </DashboardPageProviders>
    );
}
