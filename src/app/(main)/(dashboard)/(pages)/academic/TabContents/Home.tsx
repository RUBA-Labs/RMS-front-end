"use client"
import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

// Assets
import priview1 from "@/assets/priview-01.jpg"
import priview2 from "@/assets/priview-02.jpg"
import priview3 from "@/assets/priview-03.jpg"

// Service Import
// Make sure this path points to the file we created earlier
import { getCurrentUserClaims, GetCurrentUserClaimsResponse } from "@/services/api/ExamClaims/GetCurrentUserClaim"

export function Home() {
  // State to store the claims data
  const [claims, setClaims] = React.useState<GetCurrentUserClaimsResponse>([])
  // State to handle loading status
  const [isLoading, setIsLoading] = React.useState(true)

  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )

  // --- Effect: Fetch Data on Component Mount ---
  React.useEffect(() => {
    const fetchClaims = async () => {
      try {
        setIsLoading(true)
        // Call the service function
        const data = await getCurrentUserClaims()
        setClaims(data)
      } catch (error) {
        console.error("Failed to fetch claims:", error)
        // Optional: Add toast notification here if you have a toast provider
      } finally {
        setIsLoading(false)
      }
    }

    fetchClaims()
  }, [])

  const upcomingEvent = {
    title: "Introduction to Machine Learning",
    time: "10:00 AM - 12:00 PM",
    location: "Hall 203",
  }

  return (
    <>
      <div>
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Upcoming Event</h2>
          <Card>
            <CardHeader>
              <CardTitle>{upcomingEvent.title}</CardTitle>
              <CardDescription>{upcomingEvent.time} - {upcomingEvent.location}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button>View Details</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8" />

      {/* Carousel Section */}
      <div>
        <Carousel
          plugins={[plugin.current]}
          className="w-full"
        >
          <CarouselContent>
            {[priview1, priview2, priview3].map((imgSrc, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card>
                    <CardContent className="relative aspect-[4/1] p-0 overflow-hidden">
                      <Image
                        src={imgSrc}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover rounded"
                      />
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      <div className="mt-8" />

      {/* Exam Claims History Table */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Exam Claims History</h2>
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    Loading claims...
                  </TableCell>
                </TableRow>
              ) : claims.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    No exam claims found.
                  </TableCell>
                </TableRow>
              ) : (
                claims.map((claim) => (
                  <TableRow key={claim.id}>
                    {/* Accessing keys with spaces/special chars using bracket notation */}
                    <TableCell>{claim["Exam Name/Code"]}</TableCell>
                    
                    <TableCell>
                      {new Date(claim["Exam Date"]).toLocaleDateString()}
                    </TableCell>
                    
                    <TableCell>{claim.Venue}</TableCell>
                    
                    <TableCell>
                      Rs. {parseFloat(claim.Amount).toFixed(2)}
                    </TableCell>
                    
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium
                          ${claim.Status === 'APPROVED' ? 'bg-green-100 text-green-800' : ''}
                          ${claim.Status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${claim.Status === 'REJECTED' ? 'bg-red-100 text-red-800' : ''}
                        `}
                      >
                        {claim.Status}
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