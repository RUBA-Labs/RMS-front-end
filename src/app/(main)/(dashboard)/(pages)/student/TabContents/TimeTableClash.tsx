"use client";
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Import API Service
import { createConflictRequest, CreateConflictRequestDto } from "@/services/api/TimeConflictManagement/CreateConflictRequest";

type Request = {
  id: string;
  studentId: string; // Kept for local UI display
  courseCode: string;
  originalDate: string;
  originalTime: string;
  requestedSlots: { date: string; time: string }[];
  status: "Pending" | "Approved" | "Rejected";
  reason: string;
};

const initialMockRequests: Request[] = [
  {
    id: "REQ001",
    studentId: "S001",
    courseCode: "CO221",
    originalDate: "2025-12-20",
    originalTime: "08:00:00",
    requestedSlots: [
      { date: "2025-12-22", time: "10:00:00" },
      { date: "2025-12-24", time: "14:00:00" },
    ],
    status: "Pending",
    reason: "Medical appointment",
  }
];

const TimeChangeRequestForm = ({ onNewRequest }: { onNewRequest: (request: Request) => void }) => {
  // Form States
  // Note: studentId is typically extracted from the token in the backend, 
  // but we keep the input here if you want to allow manual entry for admin views or reference.
  const [studentId, setStudentId] = useState(""); 
  const [courseCode, setCourseCode] = useState("");
  const [originalTime, setOriginalTime] = useState("");
  const [originalDate, setOriginalDate] = useState("");
  const [timeSlots, setTimeSlots] = useState<{ date: string; time: string }[]>([
    { date: "", time: "" },
  ]);
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addSlot = () => {
    if (timeSlots.length < 5) {
      setTimeSlots([...timeSlots, { date: "", time: "" }]);
    }
  };

  const handleSlotChange = (
    index: number,
    field: "date" | "time",
    value: string
  ) => {
    const newSlots = [...timeSlots];
    newSlots[index][field] = value;
    setTimeSlots(newSlots);
  };

  const removeSlot = (index: number) => {
    const newSlots = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(newSlots);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!courseCode || !originalDate || !originalTime || !reason) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data strictly for the Backend API
      // Ensure time formats are HH:MM:SS (Input type="time" returns HH:MM)
      const formattedOriginalTime = originalTime.length === 5 ? `${originalTime}:00` : originalTime;
      
      const apiPayload: CreateConflictRequestDto = {
        course_code: courseCode,
        original_date: originalDate,
        original_time: formattedOriginalTime,
        reason_description: reason,
        available_slots: timeSlots
          .filter(slot => slot.date && slot.time)
          .map(slot => ({
            date: slot.date,
            time: slot.time.length === 5 ? `${slot.time}:00` : slot.time
          }))
      };

      // 1. Call the API
      await createConflictRequest(apiPayload);

      // 2. Create a local object to update the UI immediately (Optimistic Update)
      const newRequestForUI: Request = {
        id: "TEMP_ID", // This would ideally come from the backend response
        studentId, // Using the input value for display
        courseCode,
        originalDate,
        originalTime: formattedOriginalTime,
        requestedSlots: apiPayload.available_slots,
        status: "Pending",
        reason
      };

      onNewRequest(newRequestForUI);
      alert("Conflict request submitted successfully!");

      // Reset form
      setStudentId("");
      setCourseCode("");
      setOriginalTime("");
      setOriginalDate("");
      setTimeSlots([{ date: "", time: "" }]);
      setReason("");

    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
     <h2 className="text-2xl font-bold mb-4">Report a TimeTable Clash</h2> 
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Request a Time Change</CardTitle>
      </CardHeader>
      <CardContent>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input 
                id="studentId" 
                placeholder="Enter your student ID" 
                value={studentId} 
                onChange={e => setStudentId(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseCode">Course Code</Label>
              <Input 
                id="courseCode" 
                placeholder="Enter the course code" 
                value={courseCode} 
                onChange={e => setCourseCode(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="originalDate">Original Date</Label>
              <Input 
                id="originalDate" 
                type="date" 
                value={originalDate} 
                onChange={e => setOriginalDate(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Original Time</Label>
              <Input 
                id="time" 
                type="time" 
                value={originalTime} 
                onChange={e => setOriginalTime(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Available Alternative Slots</Label>
            {timeSlots.map((slot, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  type="date"
                  value={slot.date}
                  onChange={(e) =>
                    handleSlotChange(index, "date", e.target.value)
                  }
                  className="w-1/2"
                />
                <Input
                  type="time"
                  value={slot.time}
                  onChange={(e) =>
                    handleSlotChange(index, "time", e.target.value)
                  }
                  className="w-1/2"
                />
                {timeSlots.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSlot(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {timeSlots.length < 5 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSlot}
                className="mt-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Slot
              </Button>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              placeholder="Tell us why you are requesting this change"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
           <CardFooter className="px-0">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
    </div>
  );
};

const TimeTableClash = () => {
  const [requests, setRequests] = useState<Request[]>(initialMockRequests);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  const handleNewRequest = (newRequest: Request) => {
    // Generate a temporary ID for display until data is refetched from server
    const newId = `REQ${String(requests.length + 1).padStart(3, '0')}`;
    setRequests(prevRequests => [
      { ...newRequest, id: newId },
      ...prevRequests,
    ]);
  };

  return (
    <div>
      <TimeChangeRequestForm onNewRequest={handleNewRequest} />
      <h2 className="text-2xl font-bold mb-4 mt-6">Request History</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Request ID</TableHead>
            <TableHead>Course Code</TableHead>
            <TableHead>Original Slot</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.id}</TableCell>
              <TableCell>{request.courseCode}</TableCell>
              <TableCell>
                {request.originalDate}, {request.originalTime}
              </TableCell>
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
                <Dialog>
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
                        <p><strong>Original Slot:</strong> {selectedRequest.originalDate}, {selectedRequest.originalTime}</p>
                        <p><strong>Status:</strong> {selectedRequest.status}</p>
                        <p><strong>Reason:</strong> {selectedRequest.reason}</p>
                        <h4 className="font-semibold mt-4">Requested Slots:</h4>
                        <ul>
                          {selectedRequest.requestedSlots.map((slot, index) => (
                            <li key={index}>
                              {slot.date}, {slot.time}
                            </li>
                          ))}
                        </ul>
                      </div>
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
};

export default TimeTableClash;