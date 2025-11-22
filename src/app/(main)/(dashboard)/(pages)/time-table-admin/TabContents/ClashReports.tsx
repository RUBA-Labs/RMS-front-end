"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import API Services
import { getAllConflictRequests } from "@/services/api/TimeConflictManagement/RetrieveAllConflictRequests";
import { updateConflictViewStatus } from "@/services/api/TimeConflictManagement/UpdateTheViewedStatus";

// UI Interface
type Request = {
  id: string;
  studentId: string;
  courseCode: string;
  originalDay: string; // Represents Date
  originalTime: string;
  requestedSlots: { day: string; time: string }[];
  reason: string;
  isViewed: boolean;
};

export function ClashReports() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, PENDING, VIEWED

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
          originalDay: item.original_date,
          originalTime: item.original_time,
          requestedSlots: item.availableSlots.map(slot => ({
            day: slot.date,
            time: slot.time
          })),
          reason: item.reason_description,
          isViewed: item.is_viewed,
        }));

        // Sort by ID descending (Newest first)
        mappedRequests.sort((a, b) => Number(b.id) - Number(a.id));

        setRequests(mappedRequests);
      } catch (error) {
        console.error("Failed to fetch clash reports", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle View Click
  const handleView = async (request: Request) => {
    setSelectedRequest(request);

    if (!request.isViewed) {
      try {
        await updateConflictViewStatus(Number(request.id));
        setRequests((prevRequests) => 
          prevRequests.map((req) => 
            req.id === request.id ? { ...req, isViewed: true } : req
          )
        );
      } catch (error) {
        console.error("Failed to update view status", error);
      }
    }
  };

  // Clear Filters Function
  const clearFilters = () => {
    setSearchTerm("");
    setFilterDate("");
    setStatusFilter("ALL");
  };

  // Comprehensive Filter Logic
  const filteredRequests = requests.filter((req) => {
    // 1. Search Term Filter (Course, Student, Reason)
    const matchesSearch = !searchTerm || (
      req.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.reason.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Date Filter (Original Slot Date)
    const matchesDate = !filterDate || req.originalDay === filterDate;

    // 3. Status Filter (Pending vs Viewed)
    // statusFilter "PENDING" -> !isViewed
    // statusFilter "VIEWED" -> isViewed
    // statusFilter "ALL" -> true
    let matchesStatus = true;
    if (statusFilter === "PENDING") {
      matchesStatus = !req.isViewed;
    } else if (statusFilter === "VIEWED") {
      matchesStatus = req.isViewed;
    }

    return matchesSearch && matchesDate && matchesStatus;
  });

  // Split filtered results into New and Viewed for separate tables
  // If "PENDING" is selected, viewedReports will be empty naturally
  // If "VIEWED" is selected, newReports will be empty naturally
  const newReports = filteredRequests.filter(req => !req.isViewed);
  const viewedReports = filteredRequests.filter(req => req.isViewed);

  const renderTable = (title: string, reports: Request[]) => (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {reports.length === 0 ? (
        <p className="text-muted-foreground">No reports found matching your criteria.</p>
      ) : (
        <div className="rounded-md border overflow-hidden dark:border-gray-800">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Course Code</TableHead>
                <TableHead>Original Slot</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.id}</TableCell>
                  <TableCell>{request.studentId}</TableCell>
                  <TableCell>{request.courseCode}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {request.originalDay} <span className="text-muted-foreground text-xs">({request.originalTime})</span>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={request.reason}>
                    {request.reason}
                  </TableCell>
                  <TableCell>
                    <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedRequest(null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(request)}
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
                          
                          <DialogFooter className="mt-4">
                            <DialogClose asChild>
                              <Button variant="outline">Close</Button>
                            </DialogClose>
                          </DialogFooter>
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
      
      {/* Filter Bar matching the image layout */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm border dark:border-gray-800">
        {/* Search Input */}
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
            <Input
                type="text" 
                placeholder="Course Code, Student, Reason..." 
                className="dark:bg-gray-950 dark:border-gray-700 dark:text-gray-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* Date Filter */}
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Date</label>
            <Input 
                type="date" 
                className="dark:bg-gray-950 dark:border-gray-700 dark:text-gray-100 dark:[color-scheme:dark]"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
            />
        </div>

        {/* Status Filter */}
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="dark:bg-gray-950 dark:border-gray-700 dark:text-gray-100">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending (New)</SelectItem>
                <SelectItem value="VIEWED">Viewed (Processed)</SelectItem>
              </SelectContent>
            </Select>
        </div>

        {/* Clear Button */}
        <div className="flex items-end">
            <Button variant="outline" onClick={clearFilters} className="w-full dark:bg-gray-950 dark:hover:bg-gray-800">
                Clear Filters
            </Button>
        </div>
      </div>

      {/* Render Tables only if they match filters */}
      {/* If Status is PENDING or ALL, show New Reports */}
      {(statusFilter === "ALL" || statusFilter === "PENDING") && 
        renderTable("New Clash Reports", newReports)
      }
      
      {/* If Status is VIEWED or ALL, show Viewed Reports */}
      {(statusFilter === "ALL" || statusFilter === "VIEWED") && 
       (viewedReports.length > 0 || (requests.some(r => r.isViewed) && (searchTerm || filterDate))) &&
        renderTable("Viewed Clash Reports", viewedReports)
      }
    </div>
  );
}