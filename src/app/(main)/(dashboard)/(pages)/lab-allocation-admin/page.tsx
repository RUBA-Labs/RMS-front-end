import { DashboardPageProviders } from "../../providers/DashboardPageProviders"


//tabs
import { Overview } from "../lab-allocation-admin/TabContents/Overview";
import { LabManagement } from "../lab-allocation-admin/TabContents/LabManagement";
import { Reservation } from "../lab-allocation-admin/TabContents/Reservation";
import { Scheduling } from "../lab-allocation-admin/TabContents/Scheduling";


export default function LabAllocationAdmin() {
  const menuItemsLabAllocationAdmin = [
    { title: "Overview", url: "#", icon: "Overview", content: "Overview" },
    { title: "Lab Management", url: "#", icon: "LabManagement", content: "Lab Management" },
    { title: "Lab Reservation", url: "#", icon: "LabBooking", content: "Lab Booking" },
    { title: "Session Scheduling", url: "#", icon: "Scheduling", content: "Scheduling" },

  ];

  return (
    <DashboardPageProviders menuItems={menuItemsLabAllocationAdmin}>
      <div title="Overview"><Overview /></div>
      <div title="Lab Management"><LabManagement /></div>
      <div title="Lab Reservation"><Reservation /></div>
      <div title="Session Scheduling"><Scheduling /></div>

    </DashboardPageProviders>
  );
}
