"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Request = {
  id: string;
  studentId: string;
  courseCode: string;
  originalDay: string;
  originalTime: string;
  requestedSlots: { day: string; time: string }[];
  status: "Pending" | "Approved" | "Rejected";
  reason: string;
};

const initialMockRequests: Request[] = [
  {
    id: "REQ001",
    studentId: "S001",
    courseCode: "CO221",
    originalDay: "Monday",
    originalTime: "08:00",
    requestedSlots: [
      { day: "Wednesday", time: "10:00" },
      { day: "Friday", time: "14:00" },
    ],
    status: "Pending",
    reason: "Medical appointment",
  },
  {
    id: "REQ002",
    studentId: "S002",
    courseCode: "CO222",
    originalDay: "Tuesday",
    originalTime: "10:00",
    requestedSlots: [{ day: "Thursday", time: "13:00" }],
    status: "Pending",
    reason: "Family event",
  },
  {
    id: "REQ003",
    studentId: "S001",
    courseCode: "CO223",
    originalDay: "Friday",
    originalTime: "13:00",
    requestedSlots: [{ day: "Monday", time: "15:00" }],
    status: "Approved",
    reason: "Approved",
  },
    {
    id: "REQ004",
    studentId: "S003",
    courseCode: "CO224",
    originalDay: "Wednesday",
    originalTime: "11:00",
    requestedSlots: [{ day: "Friday", time: "09:00" }],
    status: "Rejected",
    reason: "Invalid reason",
  },
];

export function ClashReports() {
  const [requests, setRequests] = useState<Request[]>(initialMockRequests);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  const handleStatusChange = (requestId: string, status: "Approved" | "Rejected") => {
    setRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === requestId ? { ...req, status } : req
      )
    );
  };

  const newReports = requests.filter(req => req.status === "Pending");
  const viewedReports = requests.filter(req => req.status !== "Pending");

  const renderTable = (title: string, reports: Request[]) => (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Request ID</TableHead>
            <TableHead>Student ID</TableHead>
            <TableHead>Course Code</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.id}</TableCell>
              <TableCell>{request.studentId}</TableCell>
              <TableCell>{request.courseCode}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    request.status === "Approved"
                      ? "default"
                      : request.status === "Rejected"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {request.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedRequest(null)}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedRequest(request)}
                    >
                      View
                    </Button>
                  </DialogTrigger>
                  {selectedRequest && selectedRequest.id === request.id && (
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Request Details</DialogTitle>
                      </DialogHeader>
                      <div>
                        <p><strong>Request ID:</strong> {selectedRequest.id}</p>
                        <p><strong>Student ID:</strong> {selectedRequest.studentId}</p>
                        <p><strong>Course Code:</strong> {selectedRequest.courseCode}</p>
                        <p><strong>Original Slot:</strong> {selectedRequest.originalDay}, {selectedRequest.originalTime}</p>
                        <p><strong>Status:</strong> {selectedRequest.status}</p>
                        <p><strong>Reason:</strong> {selectedRequest.reason}</p>
                        <h4 className="font-semibold mt-4">Requested Slots:</h4>
                        <ul>
                          {selectedRequest.requestedSlots.map((slot, index) => (
                            <li key={index}>
                              {slot.day}, {slot.time}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {selectedRequest.status === 'Pending' && (
                        <DialogFooter className="mt-4">
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button onClick={() => handleStatusChange(selectedRequest.id, 'Approved')}>Approve</Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button variant="destructive" onClick={() => handleStatusChange(selectedRequest.id, 'Rejected')}>Reject</Button>
                          </DialogClose>
                        </DialogFooter>
                      )}
                    </DialogContent>
                  )}
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Clash Reports</h1>
      {renderTable("New Clash Reports", newReports)}
      {renderTable("Viewed Clash Reports", viewedReports)}
    </div>
  );
}