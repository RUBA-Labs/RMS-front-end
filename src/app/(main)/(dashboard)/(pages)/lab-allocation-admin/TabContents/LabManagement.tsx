"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Trash2, Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { createLab } from "@/services/api/ComputerLabs/create_lab";
import { updateLab } from "@/services/api/ComputerLabs/update_lab";
import { retrieveAllLabs } from "@/services/api/ComputerLabs/retrieve_all_labs";
import { createComputer } from "@/services/api/Computers/create_computer";
import { retrieveComputersFromLab } from "@/services/api/Computers/retrive_computers_from_a_lab";

// --- Types ---
type ComputerStatus = "functional" | "faulty";

interface Computer {
  computerId: string;
  name: string;
  status: ComputerStatus;
  description?: string;
  labId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Lab {
  id: string;
  name: string;
  location: string;
  capacity: number;
  computers: Computer[];
  computersWorking: number;
}

// --- Main Component ---
export function LabManagement() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingComputers, setIsLoadingComputers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [computersError, setComputersError] = useState<string | null>(null);

  const [isLabDialogOpen, setIsLabDialogOpen] = useState(false);
  const [currentLab, setCurrentLab] = useState<
    Omit<Lab, "id"> & { id?: string } | null
  >(null);

  const [isComputerDialogOpen, setIsComputerDialogOpen] = useState(false);
  const [currentComputer, setCurrentComputer] = useState<
    Omit<Computer, "computerId"> & { computerId?: string } | null
  >(null);

  const [isSavingLab, setIsSavingLab] = useState(false);
  const [isSavingComputer, setIsSavingComputer] = useState(false);

  // --- Fetch all labs on component mount ---
  useEffect(() => {
    const fetchLabs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log("[LabManagement] Fetching all labs...");

        const labDtos = await retrieveAllLabs();

        // Map LabDto to Lab
        const mappedLabs: Lab[] = labDtos.map((dto) => ({
          id: dto.id,
          name: dto.name,
          location: dto.location,
          capacity: dto.capacity,
          computersWorking: dto.computersWorking,
          computers: Array.isArray(dto.computers)
            ? (dto.computers as Computer[])
            : [],
        }));

        console.log(`[LabManagement] Successfully loaded ${mappedLabs.length} labs`);

        setLabs(mappedLabs);
        if (mappedLabs.length > 0) {
          setSelectedLab(mappedLabs[0]);
        }
      } catch (err: unknown) {
        const message = (err as Error).message || "Failed to load labs.";
        console.error("[LabManagement] Fetch labs error:", message);
        setError(message);
        window.alert(`Error loading labs: ${message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLabs();
  }, []);

  // --- Load computers when selected lab changes ---
  useEffect(() => {
    const loadComputersForLab = async () => {
      if (!selectedLab) {
        console.log("[LabManagement] No lab selected");
        return;
      }

      try {
        setIsLoadingComputers(true);
        setComputersError(null);

        console.log(
          `[LabManagement] Loading computers for Lab ID: ${selectedLab.id} (${selectedLab.name})`
        );

        // Call retrieveComputersFromLab with lab ID
        // Backend endpoint: GET /computers/lab/{labId}
        // Backend method: ComputersService.findByLabId(labId)
        const computers = await retrieveComputersFromLab(selectedLab.id);

        console.log(
          `[LabManagement] Loaded ${computers.length} computers for lab ${selectedLab.name}`
        );

        // Update the selected lab with fetched computers
        setSelectedLab((prev) =>
          prev ? { ...prev, computers } : prev
        );

        // Also update the labs state
        setLabs((prev) =>
          prev.map((lab) =>
            lab.id === selectedLab.id ? { ...lab, computers } : lab
          )
        );
      } catch (err: unknown) {
        const message = (err as Error).message || "Failed to load computers.";
        console.error("[LabManagement] Fetch computers error:", message);
        setComputersError(message);

        // Set empty computers array on error
        setSelectedLab((prev) =>
          prev ? { ...prev, computers: [] } : prev
        );
      } finally {
        setIsLoadingComputers(false);
      }
    };

    loadComputersForLab();
  }, [selectedLab?.id]);

  // --- Lab Management Handlers ---
  const handleOpenLabDialog = (lab?: Lab) => {
    if (lab) {
      setCurrentLab(lab);
    } else {
      setCurrentLab({
        name: "",
        location: "",
        capacity: 0,
        computers: [],
        computersWorking: 0,
      });
    }
    setIsLabDialogOpen(true);
  };

  const handleSaveLab = async () => {
    if (!currentLab) return;

    // Validate required fields
    if (!currentLab.name || currentLab.name.trim() === "") {
      window.alert("Lab name is required.");
      return;
    }

    if (!currentLab.location || currentLab.location.trim() === "") {
      window.alert("Lab location is required.");
      return;
    }

    if (!currentLab.capacity || currentLab.capacity <= 0) {
      window.alert("Lab capacity must be greater than 0.");
      return;
    }

    const working = Math.max(
      0,
      Math.min(currentLab.computersWorking ?? 0, currentLab.capacity ?? 0)
    );
    const disabled = Math.max(0, (currentLab.capacity ?? 0) - working);

    // --- EDIT EXISTING LAB: Call backend PATCH endpoint ---
    if (currentLab.id) {
      try {
        setIsSavingLab(true);

        const payload = {
          description: currentLab.name,
          location: currentLab.location,
          computersAvailable: currentLab.capacity,
          computersWorking: working,
          computersDisable: disabled,
        };

        console.log(
          "[LabManagement] Updating lab:",
          currentLab.id,
          "with payload:",
          payload
        );

        // Call backend PATCH /computer-labs/{id}
        const res = await updateLab(currentLab.id, payload);

        console.log("[LabManagement] Lab updated response:", res);

        // Map response to local Lab shape
        const updatedLab: Lab = {
          id: res.labId || res.id || currentLab.id,
          name: res.description || currentLab.name,
          location: res.location || currentLab.location,
          capacity: res.computersAvailable || currentLab.capacity,
          computersWorking: res.computersWorking ?? working,
          computers: Array.isArray(res.computers)
            ? (res.computers as Computer[])
            : currentLab.computers || [],
        };

        // Update state
        setLabs((prev) =>
          prev.map((l) => (l.id === updatedLab.id ? updatedLab : l))
        );

        // Update selected lab
        if (selectedLab?.id === updatedLab.id) {
          setSelectedLab(updatedLab);
        }

        setIsLabDialogOpen(false);
        setCurrentLab(null);
        window.alert("Lab updated successfully.");
        return;
      } catch (err: unknown) {
        const errorMessage = extractErrorMessage(err);
        console.error("[LabManagement] Update lab error:", errorMessage);
        window.alert(`Error updating lab: ${errorMessage}`);
        return;
      } finally {
        setIsSavingLab(false);
      }
    }

    // --- CREATE NEW LAB: Call backend POST endpoint ---
    try {
      setIsSavingLab(true);

      const payload = {
        description: currentLab.name,
        location: currentLab.location,
        computersAvailable: currentLab.capacity,
        computersWorking: working,
        computersDisable: disabled,
      };

      console.log("[LabManagement] Creating lab with payload:", payload);

      const res = await createLab(payload);

      const newLab: Lab = {
        id: res.labId,
        name: res.description || currentLab.name,
        location: res.location,
        capacity: res.computersAvailable,
        computersWorking: res.computersWorking ?? working,
        computers: [],
      };

      setLabs((prev) => [...prev, newLab]);
      setSelectedLab(newLab);
      setIsLabDialogOpen(false);
      setCurrentLab(null);
      window.alert("Lab created successfully.");
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err);
      console.error("[LabManagement] Create lab error:", errorMessage);
      window.alert(`Error creating lab: ${errorMessage}`);
    } finally {
      setIsSavingLab(false);
    }
  };

  const handleDeleteLab = (labId: string) => {
    if (window.confirm("Are you sure you want to delete this lab?")) {
      setLabs((prev) => prev.filter((l) => l.id !== labId));
      if (selectedLab?.id === labId) setSelectedLab(null);
      window.alert("Lab deleted successfully.");
    }
  };

  // --- Computer Management Handlers ---
  const handleOpenComputerDialog = (computer?: Computer) => {
    if (computer) {
      setCurrentComputer(computer);
    } else {
      setCurrentComputer({
        name: "",
        status: "functional",
        description: "",
      });
    }
    setIsComputerDialogOpen(true);
  };

  const handleSaveComputer = async () => {
    if (!currentComputer || !selectedLab) return;

    if (!currentComputer.name || currentComputer.name.trim() === "") {
      window.alert("Computer name is required.");
      return;
    }

    if (!currentComputer.status) {
      window.alert("Computer status is required.");
      return;
    }

    // If editing existing computer -> update locally only
    if (currentComputer.computerId) {
      const updatedComputers = selectedLab.computers.map((c) =>
        c.computerId === currentComputer.computerId
          ? ({ ...c, ...currentComputer } as Computer)
          : c
      );
      const updatedLab = { ...selectedLab, computers: updatedComputers };
      setLabs((prev) =>
        prev.map((l) => (l.id === updatedLab.id ? updatedLab : l))
      );
      setSelectedLab(updatedLab);
      setIsComputerDialogOpen(false);
      setCurrentComputer(null);
      window.alert("Computer updated successfully.");
      return;
    }

    // Creating new computer -> send to backend
    try {
      setIsSavingComputer(true);

      const payload = {
        labId: selectedLab.id,
        name: currentComputer.name,
        status: currentComputer.status,
        description: currentComputer.description || "",
      };

      console.log("[LabManagement] Creating computer with payload:", payload);

      const res = await createComputer(payload);

      console.log("[LabManagement] Computer created:", res);

      const newComputer: Computer = {
        computerId: res.computerId,
        name: res.name,
        status: res.status as ComputerStatus,
        description: res.description,
        labId: res.labId,
      };

      const updatedComputers = [...selectedLab.computers, newComputer];
      const updatedLab = { ...selectedLab, computers: updatedComputers };

      setLabs((prev) =>
        prev.map((l) => (l.id === updatedLab.id ? updatedLab : l))
      );

      setSelectedLab(updatedLab);
      setIsComputerDialogOpen(false);
      setCurrentComputer(null);
      window.alert("Computer added successfully.");
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err);
      console.error("[LabManagement] Create computer error:", errorMessage);
      window.alert(`Error adding computer: ${errorMessage}`);
    } finally {
      setIsSavingComputer(false);
    }
  };

  const handleDeleteComputer = (computerId: string) => {
    if (window.confirm("Are you sure you want to delete this computer?")) {
      if (!selectedLab) return;
      const updatedComputers = selectedLab.computers.filter(
        (c) => c.computerId !== computerId
      );
      const updatedLab = { ...selectedLab, computers: updatedComputers };
      setLabs((prev) =>
        prev.map((l) => (l.id === updatedLab.id ? updatedLab : l))
      );
      setSelectedLab(updatedLab);
      window.alert("Computer deleted successfully.");
    }
  };

  // --- Helper function to extract error message ---
  const extractErrorMessage = (err: unknown): string => {
    if (err instanceof Error) {
      return err.message;
    } else if (typeof err === "object" && err !== null) {
      const errorObj = err as Record<string, unknown>;
      if (errorObj.message) {
        return String(errorObj.message);
      }
      if (errorObj.error) {
        return String(errorObj.error);
      }
      return JSON.stringify(errorObj);
    }
    return "Unknown error occurred";
  };

  return (
    <div className="p-4 sm:p-6 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold">Lab & Computer Management</h1>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading labs...</span>
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-semibold">Error loading labs:</p>
          <p>{error}</p>
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel: Manage Labs */}
          <Card className="flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Manage Labs</CardTitle>
              <Dialog open={isLabDialogOpen} onOpenChange={setIsLabDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenLabDialog()}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Lab
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {currentLab?.id ? "Edit Lab" : "Add New Lab"}
                    </DialogTitle>
                    <DialogDescription>
                      {currentLab?.id
                        ? "Update lab details. Changes will be saved to the server."
                        : "Create a new computer lab."}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex flex-col gap-4 py-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="lab-name">Lab Name *</Label>
                      <Input
                        id="lab-name"
                        placeholder="e.g., Lab A1"
                        value={currentLab?.name || ""}
                        onChange={(e) =>
                          setCurrentLab((s) =>
                            s ? { ...s, name: e.target.value } : null
                          )
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        placeholder="e.g., Building A, Floor 2"
                        value={currentLab?.location || ""}
                        onChange={(e) =>
                          setCurrentLab((s) =>
                            s ? { ...s, location: e.target.value } : null
                          )
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="capacity">Capacity *</Label>
                      <Input
                        id="capacity"
                        type="number"
                        min="1"
                        placeholder="e.g., 30"
                        value={currentLab?.capacity ?? 0}
                        onChange={(e) => {
                          const cap = Math.max(1, parseInt(e.target.value) || 0);
                          setCurrentLab((s) =>
                            s
                              ? {
                                ...s,
                                capacity: cap,
                                computersWorking: Math.min(
                                  s.computersWorking ?? 0,
                                  cap
                                ),
                              }
                              : null
                          );
                        }}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="working">Working Computers</Label>
                      <Input
                        id="working"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={currentLab?.computersWorking ?? 0}
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value) || 0);
                          setCurrentLab((s) =>
                            s
                              ? {
                                ...s,
                                computersWorking: Math.min(
                                  val,
                                  s.capacity ?? val
                                ),
                              }
                              : null
                          );
                        }}
                      />
                    </div>

                    <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded">
                      <p>
                        <strong>Disabled computers:</strong>{" "}
                        {Math.max(
                          0,
                          (currentLab?.capacity ?? 0) -
                          (currentLab?.computersWorking ?? 0)
                        )}
                      </p>
                      <p className="text-xs mt-1">
                        Formula: Capacity - Working Computers
                      </p>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button onClick={handleSaveLab} disabled={isSavingLab}>
                      {isSavingLab
                        ? "Saving..."
                        : currentLab?.id
                          ? "Save Changes"
                          : "Create Lab"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-2 flex-grow overflow-y-auto">
              {labs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No labs found. Create one to get started.
                </p>
              ) : (
                labs.map((lab) => (
                  <div
                    key={lab.id}
                    className={cn(
                      "p-4 border rounded-md cursor-pointer transition-all hover:shadow-md",
                      selectedLab?.id === lab.id
                        ? "bg-blue-50 border-blue-500 border-2"
                        : "bg-background hover:bg-muted/50"
                    )}
                    onClick={() => {
                      console.log(
                        `[LabManagement] Clicked on lab: ${lab.name} (ID: ${lab.id})`
                      );
                      setSelectedLab(lab);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{lab.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {lab.location}
                        </p>
                        <div className="text-xs text-muted-foreground mt-2 space-y-1">
                          <p>
                            <strong>Computers:</strong> Working {lab.computersWorking} •
                            Disabled{" "}
                            {Math.max(0, lab.capacity - lab.computersWorking)} •
                            Capacity {lab.capacity}
                          </p>
                          <p>
                            <strong>Total Assigned:</strong> {lab.computers.length}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenLabDialog(lab);
                          }}
                          title="Edit Lab"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLab(lab.id);
                          }}
                          title="Delete Lab"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Right Panel: Manage Computers */}
          <Card className="flex flex-col h-full">
            {selectedLab ? (
              <>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Computers in {selectedLab.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Total: {selectedLab.computers.length} computers
                    </p>
                  </div>
                  <Dialog
                    open={isComputerDialogOpen}
                    onOpenChange={setIsComputerDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button onClick={() => handleOpenComputerDialog()}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Computer
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>
                          {currentComputer?.computerId
                            ? "Edit Computer"
                            : "Add New Computer"}
                        </DialogTitle>
                        <DialogDescription>
                          {currentComputer?.computerId
                            ? "Update computer details for this lab."
                            : `Add a new computer to ${selectedLab.name}.`}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="computer-name"
                            className="sm:text-right"
                          >
                            Name *
                          </Label>
                          <Input
                            id="computer-name"
                            placeholder="e.g., PC-01"
                            value={currentComputer?.name || ""}
                            onChange={(e) =>
                              setCurrentComputer((s) =>
                                s ? { ...s, name: e.target.value } : null
                              )
                            }
                            className="sm:col-span-3"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="computer-description"
                            className="sm:text-right"
                          >
                            Description
                          </Label>
                          <Input
                            id="computer-description"
                            placeholder="Optional description"
                            value={currentComputer?.description || ""}
                            onChange={(e) =>
                              setCurrentComputer((s) =>
                                s
                                  ? { ...s, description: e.target.value }
                                  : null
                              )
                            }
                            className="sm:col-span-3"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                          <Label htmlFor="status" className="sm:text-right">
                            Status *
                          </Label>
                          <Select
                            value={currentComputer?.status || ""}
                            onValueChange={(value) =>
                              setCurrentComputer((s) =>
                                s
                                  ? {
                                    ...s,
                                    status: value as ComputerStatus,
                                  }
                                  : null
                              )
                            }
                          >
                            <SelectTrigger className="sm:col-span-3">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="functional">
                                ✓ Functional
                              </SelectItem>
                              <SelectItem value="faulty">✗ Faulty</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          onClick={handleSaveComputer}
                          disabled={isSavingComputer}
                        >
                          {isSavingComputer
                            ? "Saving..."
                            : currentComputer?.computerId
                              ? "Save Changes"
                              : "Create Computer"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto">
                  {isLoadingComputers ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2 text-sm">
                        Loading computers for {selectedLab.name}...
                      </span>
                    </div>
                  ) : computersError ? (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
                      <p className="text-sm font-semibold">Notice:</p>
                      <p className="text-sm">{computersError}</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedLab.computers.length ? (
                            selectedLab.computers.map((computer) => (
                              <TableRow key={computer.computerId}>
                                <TableCell className="font-medium">
                                  {computer.name}
                                </TableCell>
                                <TableCell>
                                  {computer.description || "-"}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={cn(
                                      "text-white font-semibold",
                                      computer.status === "functional"
                                        ? "bg-green-500 hover:bg-green-600"
                                        : "bg-red-500 hover:bg-red-600"
                                    )}
                                  >
                                    {computer.status === "functional"
                                      ? "✓ Functional"
                                      : "✗ Faulty"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        handleOpenComputerDialog(computer)
                                      }
                                      title="Edit Computer"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        handleDeleteComputer(computer.computerId)
                                      }
                                      title="Delete Computer"
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="h-24 text-center text-muted-foreground"
                              >
                                No computers assigned to this lab yet.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </>
            ) : (
              <CardContent className="h-full flex items-center justify-center text-center text-muted-foreground p-6">
                <div>
                  <p className="text-lg font-semibold mb-2">No Lab Selected</p>
                  <p>Select a lab from the left panel to view its computers.</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}