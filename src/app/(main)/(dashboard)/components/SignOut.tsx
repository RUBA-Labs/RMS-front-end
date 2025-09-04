"use client";

import { useState, useEffect } from "react";
import { LogOut, XIcon } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
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
import { logoutThisDevice } from "@/services/api/Session/logout_this_device";
import { logoutSpecificDevices } from "@/services/api/Session/logout_specific_device";
import {logoutAllDevices} from "@/services/api/Session/logout_all_device";
import { getUserSessions, UserSession } from "@/services/api/Session/get_user_sessions";
import { getAuthData } from "@/services/api/Auth/auth";
import { jwtDecode, JwtPayload } from "jwt-decode";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SignOut() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLogoutOption, setSelectedLogoutOption] = useState("current");
  const [devices, setDevices] = useState<UserSession[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      if (!isDialogOpen) return;

      setLoadingDevices(true);
      setError(null);
      try {
        const authData = getAuthData();
        const decodedToken: JwtPayload | null = authData?.accessToken ? jwtDecode(authData.accessToken) : null;
        const currentDeviceId = decodedToken?.jti;

        const fetchedSessions = await getUserSessions();

        // Filter out the current device from the sessions list
        const filteredSessions = fetchedSessions.filter(
          (session) => session.id !== currentDeviceId
        );
        
        setDevices(filteredSessions);
        setSelectedDevices([]); // Ensure no devices are pre-selected
      } catch (err) {
        const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
      } finally {
        setLoadingDevices(false);
      }
    };

    fetchDevices();
  }, [isDialogOpen]);

  const handleCheckboxChange = (deviceId: string, checked: boolean) => {
    if (checked) {
      setSelectedDevices((prev) => [...prev, deviceId]);
    } else {
      setSelectedDevices((prev) => prev.filter((id) => id !== deviceId));
    }
  };

  const handleConfirmSignOut = async () => {
    setLoading(true);
    setError(null);
    try {
      switch (selectedLogoutOption) {
        case "all":
          // API call for logging out from all devices would go here
            await logoutAllDevices();
          console.log("Signing out from all devices.");
          router.push("/login");
          break;
        case "specific":
          const authData = getAuthData();
          const decodedToken: JwtPayload | null = authData?.accessToken ? jwtDecode(authData.accessToken) : null;
          const currentDeviceId = decodedToken?.jti;
          const devicesToLogout = selectedDevices.filter(id => id !== currentDeviceId);

          await logoutSpecificDevices(devicesToLogout);
          console.log("Signing out from specific devices:", devicesToLogout);
          break;
        case "current":
        default:
          await logoutThisDevice();
          console.log("Signing out from current device.");
          router.push("/login");
          break;
      }
      setIsDialogOpen(false);
      // Redirect the user after the action
      
    } catch (err: unknown) {
      const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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
             Please select an option below.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="grid grid-cols-4 justify-items-start ">
            {/* <Label htmlFor="logout-option" className="text-sm font-medium">
              Option
            </Label> */}
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
              <ScrollArea className="h-32 p-4">
                {loadingDevices ? (
                  <div className="text-center text-sm text-gray-500">Loading devices...</div>
                ) : error ? (
                  <div className="text-center text-sm text-red-500">{error}</div>
                ) : devices.length > 0 ? (
                  devices.map((device) => (
                    <TooltipProvider key={device.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex space-x-3 space-y-3">
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
                              {device.deviceName}
                            </label>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-gray-800 text-white text-xs p-2 rounded-md shadow-lg">
                          <p>
                            <strong>User Agent:</strong> {device.userAgent || "N/A"}
                          </p>
                          <p>
                            <strong>IP Address:</strong> {device.ipAddress || "N/A"}
                          </p>
                          <p>
                            <strong>Created:</strong> {device.createdAt || "N/A"}
                          </p>
                          <p>
                            <strong>Last Used:</strong> {device.lastUsedAt || "N/A"}
                          </p>
                          <p>
                            <strong>Revoked:</strong> {device.isRevoked ? "Yes" : "No"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))
                ) : (
                  <div className="text-center text-sm text-gray-500">No other devices found.</div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleConfirmSignOut}
            disabled={loading || (selectedLogoutOption === "specific" && selectedDevices.length === 0)}
          >
            {loading ? "Signing Out..." : "Confirm Sign Out"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
