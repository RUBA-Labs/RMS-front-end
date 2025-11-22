"use client"
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getAllExamClaimItems, ExamClaimItem } from "@/services/api/ExamClaims/GetAllExamClaimItems";

export function NewClaim() {
  const [claims, setClaims] = useState<ExamClaimItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<ExamClaimItem | null>(null);

  // Fetch data from API on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllExamClaimItems();
        setClaims(data);
      } catch (err) {
        console.error("Failed to fetch claims:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter only PENDING claims
  const pendingClaims = claims.filter(claim => claim.status.status === "PENDING");

  const handleViewClaim = (claim: ExamClaimItem) => {
    setSelectedClaim(claim);
    setIsDialogOpen(true);
  };

  // Placeholder for update logic (You will need an API endpoint to actually update this)
  const handleUpdateStatus = async (status: "APPROVED" | "REJECTED") => {
    if (!selectedClaim) return;

    try {
      // TODO: Call your update API here
      console.log(`Updating claim ${selectedClaim.id} to ${status}`);
      
      // Optimistic update: Remove the item from the list locally to reflect change immediately
      setClaims(prev => prev.map(c => 
        c.id === selectedClaim.id 
          ? { ...c, status: { ...c.status, status: status } } 
          : c
      ));

      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  if (loading) return <div className="p-4">Loading new claims...</div>;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">New Exam Claims</h2>
      <div className="rounded-lg shadow-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam Name/Code</TableHead>
              <TableHead>Claimant Name</TableHead>
              <TableHead>Exam Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingClaims.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">No pending claims found.</TableCell>
              </TableRow>
            ) : (
              pendingClaims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell>{claim.examName}</TableCell>
                  {/* Accessing nested name from examClaim object */}
                  <TableCell>{claim.examClaim.name}</TableCell>
                  <TableCell>{claim.examDate}</TableCell>
                  {/* Parsing string amount to number for display */}
                  <TableCell>Rs. {parseFloat(claim.amount).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleViewClaim(claim)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedClaim && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedClaim.examName}</DialogTitle>
              <DialogDescription>
                {selectedClaim.examDate} - {selectedClaim.venue}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-2">
              {/* Accessing nested details correctly */}
              <p><strong>Full Name:</strong> {selectedClaim.examClaim.name}</p>
              <p><strong>Faculty:</strong> {selectedClaim.examClaim.faculty}</p>
              <p><strong>Position:</strong> {selectedClaim.examClaim.position}</p>
              <p><strong>Amount:</strong> Rs. {parseFloat(selectedClaim.amount).toFixed(2)}</p>
              <hr className="my-2"/>
              <p><strong>Bank Name:</strong> {selectedClaim.examClaim.bankName}</p>
              <p><strong>Branch Name:</strong> {selectedClaim.examClaim.branchName}</p>
              <p><strong>Account Holder:</strong> {selectedClaim.examClaim.accountHolderName}</p>
              <p><strong>Account Number:</strong> {selectedClaim.examClaim.accountNumber}</p>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-green-500 hover:bg-green-600 text-white border-0" 
                onClick={() => handleUpdateStatus("APPROVED")}
              >
                Approve
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-red-500 hover:bg-red-600 text-white border-0" 
                onClick={() => handleUpdateStatus("REJECTED")}
              >
                Reject
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}