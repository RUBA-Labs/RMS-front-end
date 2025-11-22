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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    studentId: "S001",
    courseCode: "CO222",
    originalDay: "Tuesday",
    originalTime: "10:00",
    requestedSlots: [{ day: "Thursday", time: "13:00" }],
    status: "Approved",
    reason: "Family event",
  },
  {
    id: "REQ003",
    studentId: "S001",
    courseCode: "CO223",
    originalDay: "Friday",
    originalTime: "13:00",
    requestedSlots: [{ day: "Monday", time: "15:00" }],
    status: "Rejected",
    reason: "Not a valid reason",
  },
];

type NewRequest = Omit<Request, "id" | "status">;

const TimeChangeRequestForm = ({ onNewRequest }: { onNewRequest: (request: NewRequest) => void }) => {
  const [studentId, setStudentId] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [originalTime, setOriginalTime] = useState("");
  const [timeSlots, setTimeSlots] = useState<{ day: string; time: string }[]>([
    { day: "", time: "" },
  ]);
  const [selectedOriginalDay, setSelectedOriginalDay] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  const addSlot = () => {
    if (timeSlots.length < 5) {
      setTimeSlots([...timeSlots, { day: "", time: "" }]);
    }
  };

  const handleSlotChange = (
    index: number,
    field: "day" | "time",
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newRequest: NewRequest = {
      studentId,
      courseCode,
      originalDay: selectedOriginalDay,
      originalTime,
      requestedSlots: timeSlots.filter(slot => slot.day && slot.time),
      reason,
    };
    onNewRequest(newRequest);
    // Reset form
    setStudentId("");
    setCourseCode("");
    setOriginalTime("");
    setSelectedOriginalDay("");
    setTimeSlots([{ day: "", time: "" }]);
    setReason("");
  };

  const weekDaysOptions = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

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
              <Input id="studentId" placeholder="Enter your student ID" value={studentId} onChange={e => setStudentId(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseCode">Course Code</Label>
              <Input id="courseCode" placeholder="Enter the course code" value={courseCode} onChange={e => setCourseCode(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="originalDate">Original Day</Label>
              <Select onValueChange={setSelectedOriginalDay} value={selectedOriginalDay}>
                <SelectTrigger id="originalDate">
                  <SelectValue placeholder="Select a day" />
                </SelectTrigger>
                <SelectContent>
                  {weekDaysOptions.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Original Time</Label>
              <Input id="time" type="time" value={originalTime} onChange={e => setOriginalTime(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Available Time Slots</Label>
            {timeSlots.map((slot, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Select
                  onValueChange={(value) => handleSlotChange(index, "day", value)}
                  value={slot.day}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a day" />
                  </SelectTrigger>
                  <SelectContent>
                    {weekDaysOptions.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="time"
                  value={slot.time}
                  onChange={(e) =>
                    handleSlotChange(index, "time", e.target.value)
                  }
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
           <CardFooter>
            <Button type="submit">Submit Request</Button>
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

  const handleNewRequest = (newRequest: NewRequest) => {
    const newId = `REQ${String(requests.length + 1).padStart(3, '0')}`;
    setRequests(prevRequests => [
      ...prevRequests,
      { ...newRequest, id: newId, status: "Pending" },
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
                {request.originalDay}, {request.originalTime}
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
