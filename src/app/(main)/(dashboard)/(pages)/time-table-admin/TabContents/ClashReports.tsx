"use client";
import { useState, useEffect } from "react";
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

// Import API Service
import { getAllConflictRequests, ConflictRequestItem } from "@/services/api/TimeConflictManagement/RetrieveAllConflictRequests";

// UI Interface
type Request = {
  id: string;
  studentId: string;
  courseCode: string;
  originalDay: string; // Represents Date
  originalTime: string;
  requestedSlots: { day: string; time: string }[];
  status: "Pending" | "Approved" | "Rejected";
  reason: string;
};

export function ClashReports() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllConflictRequests();
        
        // Map API response to UI Request type
        const mappedRequests: Request[] = data.map((item) => ({
          id: item.id.toString(),
          // Displaying Full Name or ID of the user who created the request
          studentId: item.requestByUser?.fullName || item.request_create_user_id.toString(),
          courseCode: item.course_code,
          originalDay: item.original_date, // Using date as "Day"
          originalTime: item.original_time,
          requestedSlots: item.availableSlots.map(slot => ({
            day: slot.date, // Using date as "Day" for slots
            time: slot.time
          })),
          // Defaulting to Pending as API doesn't currently return status
          status: "Pending", 
          reason: item.reason_description
        }));

        setRequests(mappedRequests);
      } catch (error) {
        console.error("Failed to fetch clash reports", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Local status update handler (Visual only since no Update endpoint exists yet)
  const handleStatusChange = (requestId: string, status: "Approved" | "Rejected") => {
    setRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === requestId ? { ...req, status } : req
      )
    );
    // Close dialog if open
    if (selectedRequest?.id === requestId) {
      setSelectedRequest(prev => prev ? { ...prev, status } : null);
    }
  };

  const newReports = requests.filter(req => req.status === "Pending");
  const viewedReports = requests.filter(req => req.status !== "Pending");

  const renderTable = (title: string, reports: Request[]) => (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {reports.length === 0 ? (
        <p className="text-muted-foreground">No reports found.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Student</TableHead>
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
                          size="sm"
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
                            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                              <p><strong>Request ID:</strong> {selectedRequest.id}</p>
                              <p><strong>Student:</strong> {selectedRequest.studentId}</p>
                              <p><strong>Course Code:</strong> {selectedRequest.courseCode}</p>
                              <p><strong>Status:</strong> {selectedRequest.status}</p>
                            </div>
                            
                            <p className="text-sm mb-2"><strong>Original Slot:</strong> {selectedRequest.originalDay} at {selectedRequest.originalTime}</p>
                            <p className="text-sm mb-4"><strong>Reason:</strong> {selectedRequest.reason}</p>
                            
                            <h4 className="font-semibold text-sm mt-4 mb-2">Proposed Alternative Slots:</h4>
                            <ul className="list-disc pl-5 text-sm">
                              {selectedRequest.requestedSlots.map((slot, index) => (
                                <li key={index}>
                                  {slot.day} at {slot.time}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Only show actions if Pending */}
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
      )}
    </div>
  );

  if (isLoading) {
    return <div className="p-8 text-center">Loading clash reports...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Clash Reports</h1>
      {renderTable("New Clash Reports", newReports)}
      {renderTable("Viewed Clash Reports", viewedReports)}
    </div>
  );
}