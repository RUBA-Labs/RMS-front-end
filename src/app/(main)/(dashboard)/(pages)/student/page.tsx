import { DashboardPageProviders } from "../../providers/DashboardPageProviders"

//tabs
import { Home } from "./TabContents/Home";
import { Inbox } from "./TabContents/Inbox";
import Profile from "@/app/(main)/profile/page";
import { MySchedule } from "./TabContents/MySchedule";
import { Resources } from "./TabContents/Resources";

// Import icon components from lucide-react
import { Home as HomeIcon, UserRound, BookOpenCheck, CalendarClock, Boxes } from "lucide-react";


export default function Student() {
    // 2. Update the menuItemsStudent array to use the icon components
    const menuItemsStudent = [
        { title: "Home", url: "#", icon: HomeIcon, content: "Home" },
        { title: "Profile", url: "#", icon: UserRound, content: <Profile /> },
        { title: "My Courses", url: "#", icon: BookOpenCheck, content: "My Courses" },
        { title: "My Schedule", url: "#", icon: CalendarClock, content: "My Schedule" },
        { title: "Resources", url: "#", icon: Boxes, content: "Resources" },
    ];

    return (
        <DashboardPageProviders menuItems={menuItemsStudent}>
            <div title="Home"><Home /></div>
            <div title="Profile"><Profile /></div>
            <div title="My Courses"><Inbox /></div>
            <div title="My Schedule"><MySchedule /></div>
            <div title="Resources"><Resources /></div>
        </DashboardPageProviders>
    );
}