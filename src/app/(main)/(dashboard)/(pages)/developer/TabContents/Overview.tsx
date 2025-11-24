import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Overview() {
  const quickLinks = [
    {
      title: "Admin Dashboard",
      description: "Manage users, roles, and system settings.",
      href: "/admin",
    },
    {
      title: "Time Table Admin",
      description: "Administer and modify academic timetables.",
      href: "/time-table-admin",
    },
    {
      title: "Lab Allocation Admin",
      description: "Manage computer lab allocations and resources.",
      href: "/lab-allocation-admin",
    },
    {
      title: "Exam Claim Admin",
      description: "Handle and review exam claims from students.",
      href: "/exam-claims-admin",
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p>API: <span className="text-green-500">Online</span></p>
            <p>Database: <span className="text-green-500">Connected</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              <li>/api/auth</li>
              <li>/api/users</li>
              <li>/api/computer-labs</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No logs to display.</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickLinks.map((link) => (
            <Card key={link.title} className="flex flex-col justify-between">
              <CardHeader>
                <CardTitle>{link.title}</CardTitle>
                <CardDescription>{link.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={link.href} passHref>
                  <Button className="w-full">Go to Dashboard</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}