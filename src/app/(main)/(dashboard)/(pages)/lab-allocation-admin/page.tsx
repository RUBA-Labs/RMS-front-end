import { DashboardPageProviders } from "../../providers/DashboardPageProviders"


//tabs
import { Overview } from "../lab-allocation-admin/TabContents/Overview";
import { LabManagement } from "./TabContents/LabManagement";
import { Reservation } from "./TabContents/Reservation";
import { Scheduling } from "./TabContents/Scheduling";


export default function LabAllocationAdmin() {
  const menuItemsLabAllocationAdmin = [
    { title: "Overview", url: "#", icon: "Overview", content: "Overview" },
    { title: "Lab Management", url: "#", icon: "LabManagement", content: "Lab Management" },
    { title: "Reservation", url: "#", icon: "Reservation", content: "Reservation" },
    { title: "Scheduling", url: "#", icon: "Scheduling", content: "Scheduling" },

  ];

  return (
    <DashboardPageProviders menuItems={menuItemsLabAllocationAdmin}>
      <div title="Overview"><Overview /></div>
      <div title="Lab Management"><LabManagement /></div>
      <div title="Reservation"><Reservation /></div>
      <div title="Scheduling"><Scheduling /></div>

    </DashboardPageProviders>
  );
}
