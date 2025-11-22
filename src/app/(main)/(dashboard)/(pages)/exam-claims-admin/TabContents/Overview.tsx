"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ExamClaimItem } from "@/services/api/ExamClaims/GetAllExamClaimItems"

interface OverviewProps {
  claims: ExamClaimItem[];
}

export function Overview({ claims }: OverviewProps) {
  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Calculate summary counts based on the original full dataset
  const newClaimsCount = claims.filter(claim => claim.status.status === "PENDING").length;
  const approvedClaimsCount = claims.filter(claim => claim.status.status === "APPROVED").length;
  const rejectedClaimsCount = claims.filter(claim => claim.status.status === "REJECTED").length;

  // Filtering logic
  const filteredClaims = claims.filter(claim => {
    // 1. Search by Exam Name (Case-insensitive)
    const matchesSearch = claim.examName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Filter by Date (Exact match if date is selected)
    const matchesDate = filterDate ? claim.examDate === filterDate : true;
    
    // 3. Filter by Status
    const matchesStatus = statusFilter === "ALL" ? true : claim.status.status === statusFilter;

    return matchesSearch && matchesDate && matchesStatus;
  });

  // Function to clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilterDate("");
    setStatusFilter("ALL");
  };

  return (
    <>
      {/* Summary Cards */}
      <div className="flex flex-col md:flex-row justify-around gap-4 p-4">
        <Card className="w-full md:w-1/3">
          <CardHeader>
            <CardTitle>New Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-500">{newClaimsCount}</p>
          </CardContent>
        </Card>
        <Card className="w-full md:w-1/3">
          <CardHeader>
            <CardTitle>Approved Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600 dark:text-green-500">{approvedClaimsCount}</p>
          </CardContent>
        </Card>
        <Card className="w-full md:w-1/3">
          <CardHeader>
            <CardTitle>Rejected Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-red-600 dark:text-red-500">{rejectedClaimsCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 px-4">
        <h2 className="text-2xl font-bold mb-4">All Exam Claims</h2>
        
        {/* Filter Controls - Updated for Dark Mode */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm border dark:border-gray-800">
            {/* Search Input */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Search by Exam Name</label>
                <input 
                    type="text" 
                    placeholder="e.g. Midterm Exam..." 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-950 dark:border-gray-700 dark:text-gray-100"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Date Filter */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Date</label>
                <input 
                    type="date" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-950 dark:border-gray-700 dark:text-gray-100 dark:[color-scheme:dark]"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                />
            </div>

            {/* Status Filter */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Status</label>
                <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-950 dark:border-gray-700 dark:text-gray-100"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            </div>

            {/* Clear Button */}
            <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters} className="w-full dark:bg-gray-950 dark:hover:bg-gray-800">
                    Clear Filters
                </Button>
            </div>
        </div>

        {/* Data Table */}
        <div className="rounded-lg shadow-lg border overflow-hidden dark:border-gray-800">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam Name/Code</TableHead>
                <TableHead>Exam Date</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClaims.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No claims match your current filters.
                    </TableCell>
                 </TableRow>
              ) : (
                filteredClaims.map((claim) => (
                    <TableRow key={claim.id}>
                    <TableCell className="font-medium">{claim.examName}</TableCell>
                    <TableCell>{claim.examDate}</TableCell>
                    <TableCell>{claim.venue}</TableCell>
                    <TableCell>Rs. {parseFloat(claim.amount).toFixed(2)}</TableCell>
                    <TableCell>
                        <span
                        className={`px-2 py-1 rounded-full text-xs font-medium
                            ${claim.status.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''}
                            ${claim.status.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : ''}
                            ${claim.status.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : ''}
                        `}
                        >
                        {/* Displaying status in Title Case */}
                        {claim.status.status.charAt(0) + claim.status.status.slice(1).toLowerCase()}
                        </span>
                    </TableCell>
                    </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
}