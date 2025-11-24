"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Eye, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

type Request = {
  id: string;
  studentId: string;
  courseCode: string;
  originalDay: string;
  originalTime: string;
  requestedSlots: { day: string; time: string }[];
  reason: string;
  isViewed: boolean;
};

export function Overview() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, PENDING, VIEWED

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllConflictRequests();
        
        // Map API response to UI Request type
        const mappedRequests: Request[] = data.map((item) => ({
          id: item.id.toString(),
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
    setIsDialogOpen(true);

    // If it's a new report (not viewed yet), mark it as viewed via API
    if (!request.isViewed) {
      try {
        await updateConflictViewStatus(Number(request.id));
        
        // Update local state to reflect the change immediately
        setRequests((prevRequests) => 
          prevRequests.map((req) => 
            req.id === request.id ? { ...req, isViewed: true } : req
          )
        );
        
        // Update the selected request in state so the dialog reflects the new status
        setSelectedRequest({ ...request, isViewed: true });

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
    let matchesStatus = true;
    if (statusFilter === "PENDING") {
      matchesStatus = !req.isViewed;
    } else if (statusFilter === "VIEWED") {
      matchesStatus = req.isViewed;
    }

    return matchesSearch && matchesDate && matchesStatus;
  });

  // Derived lists based on FILTERS
  const newReports = filteredRequests.filter(req => !req.isViewed);
  const viewedReports = requests.filter(req => req.isViewed); // Keep stats accurate based on total data

  if (isLoading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="p-4">
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New Clash Reports
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newReports.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Viewed Clash Reports
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{viewedReports.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Reports
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
          </CardContent>
        </Card>
      </div>


      {/* Filter Bar */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm border dark:border-gray-800">
        {/* Search Input */}
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text" 
                    placeholder="Course Code, Student, Reason..." 
                    className="pl-9 dark:bg-gray-950 dark:border-gray-700 dark:text-gray-100"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
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

        {/* Clear Button */}
        <div className="flex items-end">
            <Button variant="outline" onClick={clearFilters} className="w-full dark:bg-gray-950 dark:hover:bg-gray-800">
                Clear Filters
            </Button>
        </div>
      </div>

      {/* New Reports Table ONLY */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">New Clash Reports</h2>
        {newReports.length === 0 ? (
            <p className="text-muted-foreground">No new reports found matching your filters.</p>
        ) : (
            <div className="rounded-md border">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Course Code</TableHead>
                    <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {newReports.map((request) => (
                    <TableRow key={request.id}>
                        <TableCell>{request.id}</TableCell>
                        <TableCell>{request.studentId}</TableCell>
                        <TableCell>{request.courseCode}</TableCell>
                        <TableCell>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleView(request)}
                            >
                                View
                            </Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
        )}
      </div>

      {/* SINGLE GLOBAL DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
                <div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                        <p><strong>Request ID:</strong> {selectedRequest.id}</p>
                        <p><strong>Student:</strong> {selectedRequest.studentId}</p>
                        <p><strong>Course Code:</strong> {selectedRequest.courseCode}</p>
                        <p><strong>Status:</strong> {selectedRequest.isViewed ? "Viewed" : "New"}</p>
                    </div>
                    
                    <p className="text-sm mb-2"><strong>Original Slot:</strong> {selectedRequest.originalDay} at {selectedRequest.originalTime}</p>
                    <p className="text-sm mb-4"><strong>Reason:</strong> {selectedRequest.reason}</p>
                    
                    <h4 className="font-semibold text-sm mt-4 mb-2">Proposed Alternative Slots:</h4>
                    {selectedRequest.requestedSlots.length > 0 ? (
                        <ul className="list-disc pl-5 text-sm">
                            {selectedRequest.requestedSlots.map((slot, index) => (
                            <li key={index}>
                                {slot.day} at {slot.time}
                            </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">No alternative slots provided.</p>
                    )}
                </div>
            )}
            
            <DialogFooter className="mt-4">
                <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}