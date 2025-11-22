"use client"
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ExamClaimItem } from "@/services/api/ExamClaims/GetAllExamClaimItems";
import { updateStatusClaim, ClaimStatusType } from "@/services/api/ExamClaims/UpdateStatusClaim";

interface NewClaimProps {
  claims: ExamClaimItem[];
  handleUpdateClaimStatus: (claimId: number, newStatus: ClaimStatusType) => void;
}

export function NewClaim({ claims, handleUpdateClaimStatus }: NewClaimProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<ExamClaimItem | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const pendingClaims = claims.filter(claim => claim.status.status === "PENDING");

  const handleViewClaim = (claim: ExamClaimItem) => {
    setSelectedClaim(claim);
    setIsDialogOpen(true);
  };

  const handleStatusUpdate = async (status: ClaimStatusType) => {
    if (!selectedClaim) return;

    const isConfirmed = window.confirm(
      `Are you sure you want to mark this claim as ${status}?`
    );

    if (!isConfirmed) return;

    setIsUpdating(true);

    try {
      await updateStatusClaim(selectedClaim.id, status);
      handleUpdateClaimStatus(selectedClaim.id, status);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update claim status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

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
                  <TableCell>{claim.examClaim.name}</TableCell>
                  <TableCell>{claim.examDate}</TableCell>
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
            
            <div className="space-y-2 text-sm">
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
                onClick={() => handleStatusUpdate("APPROVED")}
                disabled={isUpdating}
              >
                {isUpdating ? 'Processing...' : 'Approve'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-red-600 hover:bg-red-700 text-white border-0" 
                onClick={() => handleStatusUpdate("REJECTED")}
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