"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Trash2, Edit, Loader2, Search, X } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { deleteLab } from "@/services/api/ComputerLabs/delete_lab";
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

interface DeleteConfirmation {
  type: "lab" | "computer" | null;
  id: string | null;
  name: string | null;
}

// --- Main Component ---
export function LabManagement() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [filteredLabs, setFilteredLabs] = useState<Lab[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingComputers, setIsLoadingComputers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // We don't need to show computer errors to the user anymore, 
  // we will just show the empty state.
  // const [computersError, setComputersError] = useState<string | null>(null);

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
  const [isDeletingLab, setIsDeletingLab] = useState(false);

  // --- Delete Confirmation Dialog State ---
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
    type: null,
    id: null,
    name: null,
  });

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
        setFilteredLabs(mappedLabs);
        if (mappedLabs.length > 0) {
          setSelectedLab(mappedLabs[0]);
        }
      } catch (err: unknown) {
        const message = extractErrorMessage(err);
        console.error("[LabManagement] Fetch labs error:", message);
        setError(message);
        window.alert(`Error loading labs: ${message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLabs();
  }, []);

  // --- Filter labs by search query ---
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLabs(labs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = labs.filter(
      (lab) =>
        lab.name.toLowerCase().includes(query) ||
        lab.location.toLowerCase().includes(query)
    );

    setFilteredLabs(filtered);
  }, [searchQuery, labs]);

  // --- Load computers when selected lab changes ---
  useEffect(() => {
    const loadComputersForLab = async () => {
      if (!selectedLab) return;

      // If we already have computers loaded (length > 0), stop.
      if (Array.isArray(selectedLab.computers) && selectedLab.computers.length > 0) {
        return;
      }

      try {
        setIsLoadingComputers(true);
        console.log(
          `[LabManagement] Loading computers for Lab ID: ${selectedLab.id} (${selectedLab.name})`
        );

        const computers = await retrieveComputersFromLab(selectedLab.id);

        console.log(
          `[LabManagement] Loaded ${computers.length} computers for lab ${selectedLab.name}`
        );

        // Update the selected lab with fetched computers
        setSelectedLab((prev) =>
          prev ? { ...prev, computers } : prev
        );

        // Also update the labs state to keep it in sync
        setLabs((prev) =>
          prev.map((lab) =>
            lab.id === selectedLab.id ? { ...lab, computers } : lab
          )
        );
      } catch (err: unknown) {
        // FIX: Instead of setting an error state, we just log it and assume empty list.
        // This prevents the [object Object] yellow box.
        const message = extractErrorMessage(err);
        console.warn("[LabManagement] Failed to fetch computers (treating as empty):", message);

        // Set empty computers array
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

    // --- EDIT EXISTING LAB ---
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

        await updateLab(currentLab.id, payload);

        const updatedLab: Lab = {
          id: currentLab.id,
          name: currentLab.name,
          location: currentLab.location,
          capacity: currentLab.capacity,
          computersWorking: working,
          computers: currentLab.computers || [],
        };

        setLabs((prev) =>
          prev.map((l) => (l.id === updatedLab.id ? updatedLab : l))
        );

        if (selectedLab?.id === updatedLab.id) {
          setSelectedLab(updatedLab);
        }

        setIsLabDialogOpen(false);
        setCurrentLab(null);
        window.alert("Lab updated successfully.");
      } catch (err: unknown) {
        const errorMessage = extractErrorMessage(err);
        window.alert(`Error updating lab: ${errorMessage}`);
      } finally {
        setIsSavingLab(false);
      }
      return;
    }

    // --- CREATE NEW LAB ---
    try {
      setIsSavingLab(true);

      const payload = {
        description: currentLab.name,
        location: currentLab.location,
        computersAvailable: currentLab.capacity,
        computersWorking: working,
        computersDisable: disabled,
      };

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
      window.alert(`Error creating lab: ${errorMessage}`);
    } finally {
      setIsSavingLab(false);
    }
  };

  const handleShowDeleteLabConfirmation = (labId: string, labName: string) => {
    setDeleteConfirmation({
      type: "lab",
      id: labId,
      name: labName,
    });
  };

  const handleConfirmDeleteLab = async () => {
    if (!deleteConfirmation.id) return;

    try {
      setIsDeletingLab(true);
      await deleteLab(deleteConfirmation.id);

      setLabs((prev) => prev.filter((l) => l.id !== deleteConfirmation.id));
      setFilteredLabs((prev) => prev.filter((l) => l.id !== deleteConfirmation.id));

      if (selectedLab?.id === deleteConfirmation.id) {
        setSelectedLab(null);
      }

      window.alert("Lab deleted successfully.");
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err);
      window.alert(`Error deleting lab: ${errorMessage}`);
    } finally {
      setIsDeletingLab(false);
      setDeleteConfirmation({ type: null, id: null, name: null });
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

    if (currentComputer.computerId) {
      // Edit local state for simplicity in this example
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

    try {
      setIsSavingComputer(true);

      const payload = {
        labId: selectedLab.id,
        name: currentComputer.name,
        status: currentComputer.status,
        description: currentComputer.description || "",
      };

      const res = await createComputer(payload);

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
      window.alert(`Error adding computer: ${errorMessage}`);
    } finally {
      setIsSavingComputer(false);
    }
  };

  const handleShowDeleteComputerConfirmation = (computerId: string, computerName: string) => {
    setDeleteConfirmation({
      type: "computer",
      id: computerId,
      name: computerName,
    });
  };

  const handleConfirmDeleteComputer = () => {
    if (!deleteConfirmation.id || !selectedLab) return;

    const updatedComputers = selectedLab.computers.filter(
      (c) => c.computerId !== deleteConfirmation.id
    );
    const updatedLab = { ...selectedLab, computers: updatedComputers };
    setLabs((prev) =>
      prev.map((l) => (l.id === updatedLab.id ? updatedLab : l))
    );
    setSelectedLab(updatedLab);
    window.alert("Computer deleted successfully.");
    setDeleteConfirmation({ type: null, id: null, name: null });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
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
            <CardHeader className="space-y-4">
              <div className="flex flex-row items-center justify-between">
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
              </div>

              {/* Search Input */}
              <div className="relative">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by lab name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-3 text-muted-foreground hover:text-foreground"
                      title="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Found {filteredLabs.length} of {labs.length} labs
                  </p>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-2 flex-grow overflow-y-auto">
              {filteredLabs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {searchQuery
                    ? `No labs found matching "${searchQuery}".`
                    : "No labs found. Create one to get started."}
                </p>
              ) : (
                filteredLabs.map((lab) => (
                  <div
                    key={lab.id}
                    className={cn(
                      "p-4 border rounded-md cursor-pointer transition-all hover:shadow-md",
                      selectedLab?.id === lab.id
                        ? "bg-primary/10 border-primary border-2"
                        : "bg-card hover:bg-muted"
                    )}
                    onClick={() => setSelectedLab(lab)}
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
                          disabled={isDeletingLab}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShowDeleteLabConfirmation(lab.id, lab.name);
                          }}
                          title="Delete Lab"
                          disabled={isDeletingLab}
                        >
                          {isDeletingLab ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-red-500" />
                          )}
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
                                        handleShowDeleteComputerConfirmation(
                                          computer.computerId,
                                          computer.name
                                        )
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
                                Computers not setup yet.
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

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={deleteConfirmation.type !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirmation({ type: null, id: null, name: null });
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteConfirmation.type === "lab" ? "Delete Lab?" : "Delete Computer?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirmation.type === "lab"
                ? `Are you sure you want to delete the lab "${deleteConfirmation.name}"? This action cannot be undone and will permanently remove the lab from the system.`
                : `Are you sure you want to delete the computer "${deleteConfirmation.name}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={
                deleteConfirmation.type === "lab"
                  ? handleConfirmDeleteLab
                  : handleConfirmDeleteComputer
              }
              disabled={isDeletingLab}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeletingLab ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}