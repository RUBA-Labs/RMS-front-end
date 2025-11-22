"use client"
import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"


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



export function Home(){

  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )

  const upcomingEvent = {
    title: "Introduction to Machine Learning",
    time: "10:00 AM - 12:00 PM",
    location: "Hall 203",
  }

    return(
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
        </>
    )
}
    