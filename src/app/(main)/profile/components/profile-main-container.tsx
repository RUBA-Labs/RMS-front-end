import { ScrollArea } from "@/components/ui/scroll-area";

export function MainContainer({ children }: { children: React.ReactNode }) {
    return (
      <ScrollArea className="h-[75vh] w-full rounded-md hv mt-5" >
        <div className="p-4">
          {children}
        </div>
      </ScrollArea>
    );
}