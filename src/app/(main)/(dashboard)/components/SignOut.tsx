"use client";

import { useState } from "react";
import { LogOut, XIcon } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

// A mock list of devices for demonstration purposes
const mockDevices = [
  { id: "device_1", name: "Desktop (Current)" },
  { id: "device_2", name: "Laptop" },
  { id: "device_3", name: "iPhone" },
  { id: "device_4", name: "Android Phone" },
  { id: "device_5", name: "Tablet" },
  { id: "device_6", name: "Smart TV" },
  { id: "device_7", name: "Workstation" },
  { id: "device_8", name: "Desktop (Current)" },
  { id: "device_9", name: "Laptop" },
  { id: "device_10", name: "iPhone" },
  { id: "device_11", name: "Android Phone" },
  { id: "device_12", name: "Tablet" },
  { id: "device_13", name: "Smart TV" },
  { id: "device_14", name: "Workstation" },
];

export function SignOut() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLogoutOption, setSelectedLogoutOption] = useState("current");
  const [selectedDevices, setSelectedDevices] = useState<string[]>(["device_1"]);

  const handleCheckboxChange = (deviceId: string, checked: boolean) => {
    if (checked) {
      setSelectedDevices((prev) => [...prev, deviceId]);
    } else {
      setSelectedDevices((prev) => prev.filter((id) => id !== deviceId));
    }
  };

  const handleConfirmSignOut = () => {
    // Add logic for each sign out option here
    switch (selectedLogoutOption) {
      case "all":
        console.log("Signing out from all devices.");
        break;
      case "specific":
        console.log("Signing out from specific devices:", selectedDevices);
        break;
      case "current":
      default:
        console.log("Signing out from current device.");
        break;
    }
    // Redirect the user after the action
    window.location.href = "/login";
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign Out</DialogTitle>
          <DialogDescription>
            Are you sure you want to sign out? Please select an option below.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="logout-option" className="text-right">
              Option
            </Label>
            <Select
              onValueChange={setSelectedLogoutOption}
              defaultValue={selectedLogoutOption}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a logout option" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Logout Options</SelectLabel>
                  <SelectItem value="current">Logout from this device</SelectItem>
                  <SelectItem value="all">Logout from all devices</SelectItem>
                  <SelectItem value="specific">
                    Logout from specific devices
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {selectedLogoutOption === "specific" && (
            <div className="grid gap-4">
              <Label className="text-center font-semibold">
                Select devices to sign out from:
              </Label>
              <ScrollArea className="h-32">
                {mockDevices.map((device) => (
                  <div key={device.id} className="flex   space-x-3 space-y-3">
                    <Checkbox
                      id={device.id}
                      checked={selectedDevices.includes(device.id)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(device.id, !!checked)
                      }
                    />
                    <label
                      htmlFor={device.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {device.name}
                    </label>
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}
        </div>
        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleConfirmSignOut}
          >
            Confirm Sign Out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
