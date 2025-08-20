import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"


const tags = Array.from({ length: 50 }).map(
  (_, i, a) => `v1.2.0-beta.${a.length - i}`
)
export function MainArea({ children }: { children: React.ReactNode }) {
    return (
      <ScrollArea className="h-[75vh] w-full rounded-md hv mt-5" >
        <div className="p-4">
          {children}
        </div>
      </ScrollArea>
    );
}