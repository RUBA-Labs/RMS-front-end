"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExamClaimItem } from "@/services/api/ExamClaims/GetAllExamClaimItems"

interface OverviewProps {
  claims: ExamClaimItem[];
}

export function Overview({ claims }: OverviewProps) {
  // Calculate counts based on the nested status object from API (e.g., "PENDING", "APPROVED")
  const newClaimsCount = claims.filter(claim => claim.status.status === "PENDING").length;
  const approvedClaimsCount = claims.filter(claim => claim.status.status === "APPROVED").length;
  const rejectedClaimsCount = claims.filter(claim => claim.status.status === "REJECTED").length;

  return (
    <>
      <div className="flex justify-around gap-4 p-4">
        <Card className="w-1/3">
          <CardHeader>
            <CardTitle>New Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{newClaimsCount}</p>
          </CardContent>
        </Card>
        <Card className="w-1/3">
          <CardHeader>
            <CardTitle>Approved Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{approvedClaimsCount}</p>
          </CardContent>
        </Card>
        <Card className="w-1/3">
          <CardHeader>
            <CardTitle>Rejected Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{rejectedClaimsCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">All Exam Claims</h2>
        <div className="rounded-lg shadow-lg border">
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
              {claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell>{claim.examName}</TableCell>
                  <TableCell>{claim.examDate}</TableCell>
                  <TableCell>{claim.venue}</TableCell>
                  <TableCell>Rs. {parseFloat(claim.amount).toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium
                        ${claim.status.status === 'APPROVED' ? 'bg-green-100 text-green-800' : ''}
                        ${claim.status.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${claim.status.status === 'REJECTED' ? 'bg-red-100 text-red-800' : ''}
                      `}
                    >
                      {/* Displaying status in Title Case for better UI looks */}
                      {claim.status.status.charAt(0) + claim.status.status.slice(1).toLowerCase()}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
}