"use client"
import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import priview1 from "@/assets/priview-01.jpg"
import priview2 from "@/assets/priview-02.jpg"
import priview3 from "@/assets/priview-03.jpg"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const claims = [
  {
    examName: "Mathematics 101",
    examDate: "2023-01-15",
    venue: "Room A1",
    amount: 1500.00,
    status: "Approved",
  },
  {
    examName: "Physics 201",
    examDate: "2023-02-20",
    venue: "Room B2",
    amount: 2000.00,
    status: "Pending",
  },
  {
    examName: "Chemistry 301",
    examDate: "2023-03-10",
    venue: "Room C3",
    amount: 2500.00,
    status: "Rejected",
  },
]
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

export function Home() {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )

  const upcomingEvent = {
        title: "Introduction to Machine Learning",
        time: "10:00 AM - 12:00 PM",
        location: "Hall 203",
    };
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

<div className="mt-8"/> 

{/*     <div className="p-0 mt-8 mb-10 h-20 ">
        <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>
            <div >
                <ResizablePanelGroup direction="horizontal">
                <ResizablePanel>
                    <div className="flex flex-wrap items-center gap- md:flex-row">
              
                
                    <Button className="opacity-80 w-60 h-20 text-lg">Inbox</Button>
                    </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel>
                    <div className="flex flex-wrap items-center gap- md:flex-row">
                    <Button className="opacity-80 w-60 h-20 text-lg">Time Table</Button>
                    </div>
                </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
            <div >
                <ResizablePanelGroup direction="horizontal">
                <ResizablePanel>
                    <div className="flex flex-wrap items-center gap- md:flex-row">
                    <Button className="opacity-80 w-60 h-20 text-lg">Exam Claims</Button>
                    </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel>
                    <div className="flex flex-wrap items-center gap- md:flex-row">
                    <Button className="opacity-80 w-60 h-20 text-lg">Calendar</Button>
                    </div>
                </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </ResizablePanel>
        </ResizablePanelGroup>
        
    </div>
 */}
    <div>
    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      //onMouseEnter={plugin.current.stop}
      //onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
          {[priview1, priview2, priview3].map((imgSrc, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card>
                  <CardContent className="relative aspect-[4/1] p-0 overflow-hidden">
                    <img
                      src={imgSrc.src}
                      alt={`Preview ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover rounded"
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

    <div className="mt-8"/> 

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
