import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"

export function Resources(){
    return(
        <Select>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Resources" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="Lecture Theatre">Lecture Theatre</SelectItem>
                <SelectItem value="MultiMedia">MultiMedia</SelectItem>
            </SelectContent>
        </Select>
        
    )
}