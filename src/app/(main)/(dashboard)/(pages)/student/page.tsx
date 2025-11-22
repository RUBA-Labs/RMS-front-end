import { DashboardPageProviders } from "../../providers/DashboardPageProviders"

//tabs
import { Home } from "./TabContents/Home";
import Profile from "@/app/(main)/profile/page";

import { Resources } from "./TabContents/Resources";
import  Timetable  from "./TabContents/StudentTimetable";

export default function Student() {
    const menuItemsStudent = [
        { title: "Home", url: "#", icon: "Home", content: "Home" },
        { title: "Profile", url: "#", icon: "UserRound", content: "Profile" },
        { title: "Timetable", url: "#", icon: "Calendar", content: "Timetable" },
        { title: "My Courses", url: "#", icon: "BookOpenCheck", content: "My Courses" },
        { title: "Resources", url: "#", icon: "Boxes", content: "Resources" }
    ];

    return (
        <DashboardPageProviders menuItems={menuItemsStudent}>
            <div title="Home"><Home /></div>
            <div title="Profile"><Profile /></div>
            <div title="Resources"><Resources /></div>
            <div title="Timetable"><Timetable /></div>
        </DashboardPageProviders>
    );
}
