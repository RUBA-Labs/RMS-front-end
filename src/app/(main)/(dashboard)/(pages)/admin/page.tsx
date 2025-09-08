import { DashboardPageProviders } from "../../providers/DashboardPageProviders"
import { AuthProvider } from "@/providers/AuthProvider";
import { Role } from "@/services/api/Auth/roles";


//tabs
import { Overview } from "./TabContents/Overview";
import Users from "./TabContents/Users/Users";


export default function Admin() {
   const menuItemsAdmin = [
    { title: "Overview", url: "#", icon: "Overview", content: "Overview" },
    { title: "Users", url: "#", icon: "Users", content: "Users" },
  ];

  return (


    <AuthProvider allowedRoles={[
      Role.ADMIN,
      Role.DEVELOPER,
      Role.TIME_TABLE_ADMIN,
      Role.EXAM_CLAIMS_ADMIN,
      Role.LAB_ALLOCATION_ADMIN
    ]} isEnabled={true}>

    <DashboardPageProviders menuItems={menuItemsAdmin}>
      <div title="Overview"><Overview /></div>
      <div title="Users"><Users /></div>


    </DashboardPageProviders>
    </AuthProvider>
  );
}
