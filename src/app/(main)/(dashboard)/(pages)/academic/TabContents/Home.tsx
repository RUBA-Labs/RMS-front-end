"use client"
import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import { Card, CardContent } from "@/components/ui/card"
import priview1 from "@/assets/priview-01.jpg"
import priview2 from "@/assets/priview-02.jpg"
import priview3 from "@/assets/priview-03.jpg"
import { Button } from "@/components/ui/button"
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
  return (
    <>
    <div className="p-0 mt-8 mb-10 h-20 ">
        <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>
            <div >
                <ResizablePanelGroup direction="horizontal">
                <ResizablePanel>
                    <div className="flex flex-wrap items-center gap- md:flex-row">
                        {/* Link to /dashboard */}
                
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
    </>
  )
}
