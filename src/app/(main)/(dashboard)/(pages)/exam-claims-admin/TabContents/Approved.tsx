"use client"
import { useState } from "react";
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

interface ApprovedProps {
  claims: Claim[];
}

export function Approved({ claims }: ApprovedProps) {
  const approvedClaims = claims.filter(claim => claim.status === "Approved");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  const handleViewClaim = (claim: Claim) => {
    setSelectedClaim(claim);
    setIsDialogOpen(true);
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
            {approvedClaims.map((claim, index) => (
              <TableRow key={index}>
                <TableCell>{claim.examName}</TableCell>
                <TableCell>{claim.fullName}</TableCell>
                <TableCell>{claim.examDate}</TableCell>
                <TableCell>Rs. {claim.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewClaim(claim)}>
                      View
                    </Button>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
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
                  <p><strong>Amount:</strong> Rs. {selectedClaim.amount.toFixed(2)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:h-[1px]">Claimant Information</CardTitle>
                </CardHeader>
                <CardContent className="grid">
                  <p><strong>Full Name:</strong> {selectedClaim.fullName}</p>
                  <p><strong>Faculty:</strong> {selectedClaim.faculty}</p>
                  <p><strong>Position:</strong> {selectedClaim.position}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:h-[1px]">Bank Details</CardTitle>
                </CardHeader>
                <CardContent className="grid">
                  <p><strong>Bank Name:</strong> {selectedClaim.bankName}</p>
                  <p><strong>Branch Name:</strong> {selectedClaim.branchName}</p>
                  <p><strong>Account Holder Name:</strong> {selectedClaim.accountHolderName}</p>
                  <p><strong>Account Number:</strong> {selectedClaim.accountNumber}</p>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}