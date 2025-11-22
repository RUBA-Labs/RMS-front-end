"use client"
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Import Interfaces
import { ExamClaimItem } from "@/services/api/ExamClaims/GetAllExamClaimItems";
// Import Delete Service
import { deleteExamClaimItem } from "@/services/api/ExamClaims/DeleteClaim";

interface ApprovedProps {
  claims: ExamClaimItem[];
}

export function Approved({ claims: initialClaims }: ApprovedProps) {
  // Local state to manage the list of claims. 
  // This allows us to remove an item from the UI immediately after deletion 
  // without waiting for a parent re-fetch.
  const [localClaims, setLocalClaims] = useState<ExamClaimItem[]>(initialClaims);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<ExamClaimItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync local state if the parent passes new props
  useEffect(() => {
    setLocalClaims(initialClaims);
  }, [initialClaims]);

  // Strictly filter for "APPROVED" status
  const approvedClaims = localClaims.filter(claim => claim.status.status === "APPROVED");

  const handleViewClaim = (claim: ExamClaimItem) => {
    setSelectedClaim(claim);
    setIsDialogOpen(true);
  };

  // Handle Delete Action
  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this approved claim? This action cannot be undone.");
    
    if (!confirmDelete) return;

    setIsDeleting(true);

    try {
      // 1. Call API
      await deleteExamClaimItem(id);

      // 2. Update UI on success
      setLocalClaims(prevClaims => prevClaims.filter(claim => claim.id !== id));
      
      alert("Claim deleted successfully.");

    } catch (error) {
      console.error("Failed to delete claim:", error);
      alert("Failed to delete claim. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Approved Exam Claims</h2>
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
            {approvedClaims.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">No approved claims found.</TableCell>
              </TableRow>
            ) : (
              approvedClaims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell>{claim.examName}</TableCell>
                  <TableCell>{claim.examClaim.name}</TableCell>
                  <TableCell>{claim.examDate}</TableCell>
                  <TableCell>Rs. {parseFloat(claim.amount).toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewClaim(claim)}>
                        View
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDelete(claim.id)}
                        disabled={isDeleting}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedClaim && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px] sm:h-auto">
            <DialogHeader>
              <DialogTitle>{selectedClaim.examName}</DialogTitle>
              <DialogDescription>
                {selectedClaim.examDate} - {selectedClaim.venue}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:h-[1px]">Claim Details</CardTitle>
                </CardHeader>
                <CardContent className="grid">
                  <p><strong>Amount:</strong> Rs. {parseFloat(selectedClaim.amount).toFixed(2)}</p>
                  <p><strong>Status:</strong> <span className="text-green-600 font-bold">{selectedClaim.status.status}</span></p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:h-[1px]">Claimant Information</CardTitle>
                </CardHeader>
                <CardContent className="grid">
                  <p><strong>Full Name:</strong> {selectedClaim.examClaim.name}</p>
                  <p><strong>Faculty:</strong> {selectedClaim.examClaim.faculty}</p>
                  <p><strong>Position:</strong> {selectedClaim.examClaim.position}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:h-[1px]">Bank Details</CardTitle>
                </CardHeader>
                <CardContent className="grid">
                  <p><strong>Bank Name:</strong> {selectedClaim.examClaim.bankName}</p>
                  <p><strong>Branch Name:</strong> {selectedClaim.examClaim.branchName}</p>
                  <p><strong>Account Holder Name:</strong> {selectedClaim.examClaim.accountHolderName}</p>
                  <p><strong>Account Number:</strong> {selectedClaim.examClaim.accountNumber}</p>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}