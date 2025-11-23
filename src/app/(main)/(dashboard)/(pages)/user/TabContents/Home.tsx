"use client"
import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutDashboard, CalendarDays, CreditCard, Users, Accessibility, Workflow } from "lucide-react";


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

  const features = [
    {
      icon: <Workflow className="h-6 w-6 text-primary" />,
      title: "Streamlined Resource Allocation",
      description: "Designed to streamline resource allocation and scheduling within the Arts Faculty, ensuring efficient coordination.",
    },
    {
      icon: <LayoutDashboard className="h-6 w-6 text-primary" />,
      title: "Intuitive Lab Management",
      description: "Provides an intuitive interface for managing lab allocations, making the process simple and efficient.",
    },
    {
      icon: <CalendarDays className="h-6 w-6 text-primary" />,
      title: "Timetable Organization",
      description: "Facilitates creating and organizing timetables, reducing administrative workload for faculty.",
    },
    {
      icon: <CreditCard className="h-6 w-6 text-primary" />,
      title: "Exam Payment Claims",
      description: "Handles exam payment claims for lecturers, simplifying financial processes.",
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Efficient Coordination",
      description: "Ensures efficient coordination between students, lecturers, and administrators.",
    },
    {
      icon: <Accessibility className="h-6 w-6 text-primary" />,
      title: "Improved Accessibility",
      description: "Enhances accessibility to resources and information for all users within the system.",
    },
  ];

    return(
        <>
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

      <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Website Purpose</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    {feature.icon}
                    <CardTitle>{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
          </div>
        </>
    )
}
    