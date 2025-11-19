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

interface Claim {
  examName: string;
  examDate: string;
  venue: string;
  amount: number;
  status: "Pending" | "Approved" | "Rejected";
  fullName: string;
  faculty: string;
  position: string;
  bankName: string;
  branchName: string;
  accountHolderName: string;
  accountNumber: string;
}

interface NewClaimProps {
  claims: Claim[];
  handleUpdateClaimStatus: (claim: Claim, newStatus: "Pending" | "Approved" | "Rejected") => void;
}

export function NewClaim({ claims, handleUpdateClaimStatus }: NewClaimProps) {
  const pendingClaims = claims.filter(claim => claim.status === "Pending");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  const handleViewClaim = (claim: Claim) => {
    setSelectedClaim(claim);
    setIsDialogOpen(true);
  };

  const handleApprove = () => {
    if (selectedClaim) {
      handleUpdateClaimStatus(selectedClaim, "Approved");
      setIsDialogOpen(false);
    }
  };

  const handleReject = () => {
    if (selectedClaim) {
      handleUpdateClaimStatus(selectedClaim, "Rejected");
      setIsDialogOpen(false);
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
            {pendingClaims.map((claim, index) => (
              <TableRow key={index}>
                <TableCell>{claim.examName}</TableCell>
                <TableCell>{claim.fullName}</TableCell>
                <TableCell>{claim.examDate}</TableCell>
                <TableCell>Rs. {claim.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleViewClaim(claim)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
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
              <p><strong>Full Name:</strong> {selectedClaim.fullName}</p>
              <p><strong>Faculty:</strong> {selectedClaim.faculty}</p>
              <p><strong>Position:</strong> {selectedClaim.position}</p>
              <p><strong>Amount:</strong> Rs. {selectedClaim.amount.toFixed(2)}</p>
              <hr/>
              <p><strong>Bank Name:</strong> {selectedClaim.bankName}</p>
              <p><strong>Branch Name:</strong> {selectedClaim.branchName}</p>
              <p><strong>Account Holder Name:</strong> {selectedClaim.accountHolderName}</p>
              <p><strong>Account Number:</strong> {selectedClaim.accountNumber}</p>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" className="bg-green-500 text-white" onClick={handleApprove}>Approve</Button>
              <Button variant="outline" size="sm" className="bg-red-500 text-white" onClick={handleReject}>Reject</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}