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

// Import the Fetch Service and Type
import { getAllExamClaimItems, ExamClaimItem } from "@/services/api/ExamClaims/GetAllExamClaimItems";
// Import the Update Service and Type
import { updateStatusClaim, ClaimStatusType } from "@/services/api/ExamClaims/UpdateStatusClaim";

export function NewClaim() {
  // State for storing all claims fetched from the API
  const [claims, setClaims] = useState<ExamClaimItem[]>([]);
  // State for initial page loading
  const [loading, setLoading] = useState(true);
  // State for controlling the details modal
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<ExamClaimItem | null>(null);
  
  // State to manage the loading/disabled state of the Approve/Reject buttons during API calls
  const [isUpdating, setIsUpdating] = useState(false);

  // 1. Fetch data from API on component mount
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

  // 2. Filter only 'PENDING' claims for the "New Claims" view
  // We filter the main list so that when we update a status, it automatically disappears from this view
  const pendingClaims = claims.filter(claim => claim.status.status === "PENDING");

  // Opens the modal with the selected claim details
  const handleViewClaim = (claim: ExamClaimItem) => {
    setSelectedClaim(claim);
    setIsDialogOpen(true);
  };

  // 3. Handle Status Update (Approve/Reject)
  const handleUpdateStatus = async (status: ClaimStatusType) => {
    if (!selectedClaim) return;

    // Confirmation Popup
    const isConfirmed = window.confirm(
      `Are you sure you want to mark this claim as ${status}?`
    );

    if (!isConfirmed) return;

    setIsUpdating(true);

    try {
      // Call the API service to update status in the backend
      await updateStatusClaim(selectedClaim.id, status);

      // Update Local State on Success:
      // We update the specific claim in the main `claims` array. 
      // Because `pendingClaims` is derived by filtering for "PENDING", 
      // changing the status to APPROVED/REJECTED here removes it from the table automatically.
      setClaims(prev => prev.map(c => 
        c.id === selectedClaim.id 
          ? { ...c, status: { ...c.status, status: status } } 
          : c
      ));

      setIsDialogOpen(false);
      
      // Optional: Success Alert or Toast
      // alert(`Claim successfully marked as ${status}`);

    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update claim status. Please try again.");
    } finally {
      setIsUpdating(false);
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

      {/* Details Dialog */}
      {selectedClaim && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedClaim.examName}</DialogTitle>
              <DialogDescription>
                {selectedClaim.examDate} - {selectedClaim.venue}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-2 text-sm">
              {/* Displaying Nested Data */}
              <div className="grid grid-cols-2 gap-1">
                <p className="font-semibold">Full Name:</p> <p>{selectedClaim.examClaim.name}</p>
                <p className="font-semibold">Faculty:</p> <p>{selectedClaim.examClaim.faculty}</p>
                <p className="font-semibold">Position:</p> <p>{selectedClaim.examClaim.position}</p>
                <p className="font-semibold">Amount:</p> <p>Rs. {parseFloat(selectedClaim.amount).toFixed(2)}</p>
              </div>
              
              <hr className="my-4"/>
              
              <div className="grid grid-cols-2 gap-1">
                <p className="font-semibold">Bank Name:</p> <p>{selectedClaim.examClaim.bankName}</p>
                <p className="font-semibold">Branch Name:</p> <p>{selectedClaim.examClaim.branchName}</p>
                <p className="font-semibold">Account Holder:</p> <p>{selectedClaim.examClaim.accountHolderName}</p>
                <p className="font-semibold">Account Number:</p> <p>{selectedClaim.examClaim.accountNumber}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-green-600 hover:bg-green-700 text-white border-0" 
                onClick={() => handleUpdateStatus("APPROVED")}
                disabled={isUpdating}
              >
                {isUpdating ? 'Processing...' : 'Approve'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-red-600 hover:bg-red-700 text-white border-0" 
                onClick={() => handleUpdateStatus("REJECTED")}
                disabled={isUpdating}
              >
                 {isUpdating ? 'Processing...' : 'Reject'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}