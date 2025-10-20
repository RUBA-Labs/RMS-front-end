import { ScrollArea } from "@/components/ui/scroll-area";

export function MainContainer({ children }: { children: React.ReactNode }) {
    return (
      <ScrollArea className="h-[78vh] w-full rounded-md hv" >
        <div className="p-4 xlg:mx-20 lg:mx-20 md:mx-10 sm:mx-5 xs:mx-2">
          {children}
        </div>
      </ScrollArea>
    );
}