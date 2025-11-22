"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const adminSections = [
  {
    title: "Time Table Admin",
    description: "Manage and organize course timetables, handle scheduling conflicts, and publish official timetables for the faculty.",
    link: "/time-table-admin", // Placeholder link
  },
  {
    title: "Lab Allocation Admin",
    description: "Allocate computer labs for practical sessions, manage lab bookings, and ensure efficient utilization of lab resources.",
    link: "/lab-allocation-admin", // Placeholder link
  },
  {
    title: "Exam Claims Admin",
    description: "Process and manage exam payment claims submitted by lecturers, verify details, and handle approvals.",
    link: "/exam-claims-admin", // Placeholder link
  },
];

export function Overview() {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminSections.map((section, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{section.description}</CardDescription>
            </CardContent>
            <CardFooter>
              <Link href={section.link} passHref>
                <Button>Go to Dashboard</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}