"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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

interface OverviewProps {
  claims: Claim[];
}

export function Overview({ claims }: OverviewProps) {
  const newClaimsCount = claims.filter(claim => claim.status === "Pending").length;
  const approvedClaimsCount = claims.filter(claim => claim.status === "Approved").length;
  const rejectedClaimsCount = claims.filter(claim => claim.status === "Rejected").length;

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
              {claims.map((claim, index) => (
                <TableRow key={index}>
                  <TableCell>{claim.examName}</TableCell>
                  <TableCell>{claim.examDate}</TableCell>
                  <TableCell>{claim.venue}</TableCell>
                  <TableCell>Rs. {claim.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium
                        ${claim.status === 'Approved' ? 'bg-green-100 text-green-800' : ''}
                        ${claim.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${claim.status === 'Rejected' ? 'bg-red-100 text-red-800' : ''}
                      `}
                    >
                      {claim.status}
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