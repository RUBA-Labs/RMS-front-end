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
import { ExamClaimItem } from "@/services/api/ExamClaims/GetAllExamClaimItems";

interface RejectedProps {
  claims: ExamClaimItem[];
}

export function Rejected({ claims }: RejectedProps) {
  const rejectedClaims = claims.filter(claim => claim.status.status === "REJECTED");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<ExamClaimItem | null>(null);

  const handleViewClaim = (claim: ExamClaimItem) => {
    setSelectedClaim(claim);
    setIsDialogOpen(true);
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Rejected Exam Claims</h2>
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
            {rejectedClaims.map((claim, index) => (
              <TableRow key={index}>
                <TableCell>{claim.examName}</TableCell>
                <TableCell>{claim.examClaim.name}</TableCell>
                <TableCell>{claim.examDate}</TableCell>
                <TableCell>Rs. {parseFloat(claim.amount).toFixed(2)}</TableCell>
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
            <div className="grid gap-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:h-[1px]">Claim Details</CardTitle>
                </CardHeader>
                <CardContent className="grid">
                  <p><strong>Amount:</strong> Rs. {parseFloat(selectedClaim.amount).toFixed(2)}</p>
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