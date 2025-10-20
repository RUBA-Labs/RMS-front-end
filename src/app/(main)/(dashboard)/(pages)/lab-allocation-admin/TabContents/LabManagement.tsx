// components/ui/lab-management.tsx
"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PlusCircle, Trash2, Edit } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

// --- 1. Data and Types ---
type ComputerStatus = "functional" | "faulty" | "in-use";

interface Computer {
  id: string;
  name: string;
  status: ComputerStatus;
}

interface Lab {
  id: string;
  name: string;
  location: string;
  capacity: number;
  computers: Computer[];
}

const initialLabs: Lab[] = [
  {
    id: "lab-a1",
    name: "Lab A1",
    location: "Building 3, Floor 2",
    capacity: 25,
    computers: [
      { id: "c1", name: "PC-A1-01", status: "functional" },
      { id: "c2", name: "PC-A1-02", status: "faulty" },
      { id: "c3", name: "PC-A1-03", status: "in-use" },
      { id: "c4", name: "PC-A1-04", status: "functional" },
    ],
  },
  {
    id: "lab-b2",
    name: "Lab B2",
    location: "Building 5, Floor 1",
    capacity: 30,
    computers: [
      { id: "c5", name: "PC-B2-01", status: "functional" },
      { id: "c6", name: "PC-B2-02", status: "functional" },
      { id: "c7", name: "PC-B2-03", status: "in-use" },
    ],
  },
  {
    id: "lab-c3",
    name: "Lab C3",
    location: "Building 3, Floor 3",
    capacity: 20,
    computers: [],
  },
];

// --- 2. Main Component ---
export function LabManagement() {
  const [labs, setLabs] = useState<Lab[]>(initialLabs);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(initialLabs[0]);

  const [isLabDialogOpen, setIsLabDialogOpen] = useState(false);
  const [currentLab, setCurrentLab] = useState<Omit<Lab, 'id'> & { id?: string } | null>(null);

  const [isComputerDialogOpen, setIsComputerDialogOpen] = useState(false); 
  const [currentComputer, setCurrentComputer] = useState<Omit<Computer, 'id'> & { id?: string } | null>(null);

  // --- Lab Management Handlers ---
  const handleOpenLabDialog = (lab?: Lab) => {
    if (lab) {
      setCurrentLab(lab);
    } else {
      setCurrentLab({ name: "", location: "", capacity: 0, computers: [] });
    }
    setIsLabDialogOpen(true);
  };

  const handleSaveLab = () => {
    if (!currentLab) return;
    if (currentLab.id) {
      setLabs(labs.map(l => l.id === currentLab.id ? { ...l, ...currentLab } as Lab : l));
    } else {
      const newLab: Lab = { ...currentLab, id: Date.now().toString(), computers: [] } as Lab;
      setLabs([...labs, newLab]);
    }
    setIsLabDialogOpen(false);
  };

  const handleDeleteLab = (labId: string) => {
    setLabs(labs.filter(l => l.id !== labId));
    if (selectedLab?.id === labId) {
      setSelectedLab(null);
    }
  };

  // --- Computer Management Handlers ---
  const handleOpenComputerDialog = (computer?: Computer) => {
    if (computer) {
      setCurrentComputer(computer);
    } else {
      setCurrentComputer({ name: "", status: "functional" });
    }
    setIsComputerDialogOpen(true);
  };

  const handleSaveComputer = () => {
    if (!currentComputer || !selectedLab) return;

    let updatedComputers: Computer[];
    if (currentComputer.id) {
      updatedComputers = selectedLab.computers.map(c => c.id === currentComputer.id ? { ...c, ...currentComputer } as Computer : c);
    } else {
      const newComputer: Computer = { ...currentComputer, id: Date.now().toString() } as Computer;
      updatedComputers = [...selectedLab.computers, newComputer];
    }

    const updatedLab = { ...selectedLab, computers: updatedComputers };
    setLabs(labs.map(l => l.id === updatedLab.id ? updatedLab : l));
    setSelectedLab(updatedLab);
    setIsComputerDialogOpen(false);
  };

  const handleDeleteComputer = (computerId: string) => {
    if (!selectedLab) return;
    const updatedComputers = selectedLab.computers.filter(c => c.id !== computerId);
    const updatedLab = { ...selectedLab, computers: updatedComputers };
    setLabs(labs.map(l => l.id === updatedLab.id ? updatedLab : l));
    setSelectedLab(updatedLab);
  };

  // --- Computer Table Columns ---
  const computerColumns: ColumnDef<Computer>[] = [
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const color = status === "functional" ? "bg-green-500" : status === "faulty" ? "bg-red-500" : "bg-yellow-500";
        return <Badge className={cn("text-white", color)}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => handleOpenComputerDialog(row.original)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteComputer(row.original.id)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  const computerTable = useReactTable({
    data: selectedLab?.computers || [],
    columns: computerColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-4 sm:p-6 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold">Lab & Computer Management</h1>
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
                  <DialogTitle>{currentLab?.id ? "Edit Lab" : "Add New Lab"}</DialogTitle>
                  <DialogDescription>
                    {currentLab?.id ? "Update lab details." : "Create a new lab."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="lab-name" className="sm:text-right">Name</Label>
                    <Input id="lab-name" value={currentLab?.name || ''} onChange={e => setCurrentLab(s => s ? { ...s, name: e.target.value } : null)} className="sm:col-span-3" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="sm:text-right">Location</Label>
                    <Input id="location" value={currentLab?.location || ''} onChange={e => setCurrentLab(s => s ? { ...s, location: e.target.value } : null)} className="sm:col-span-3" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="capacity" className="sm:text-right">Capacity</Label>
                    <Input id="capacity" type="number" value={currentLab?.capacity || 0} onChange={e => setCurrentLab(s => s ? { ...s, capacity: parseInt(e.target.value) || 0 } : null)} className="sm:col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSaveLab}>{currentLab?.id ? "Save Changes" : "Create Lab"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-2 flex-grow overflow-y-auto">
            {labs.map(lab => (
              <div
                key={lab.id}
                className={cn(
                  "p-4 border rounded-md cursor-pointer transition-colors hover:bg-muted/50",
                  selectedLab?.id === lab.id ? "bg-muted border-primary" : "bg-background"
                )}
                onClick={() => setSelectedLab(lab)}
              >
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-lg">{lab.name}</p>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleOpenLabDialog(lab); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteLab(lab.id); }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{lab.location}</p>
                <p className="text-xs text-muted-foreground">Computers: {lab.computers.length} / {lab.capacity}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right Panel: Manage Computers */}
        <Card className="flex flex-col h-full">
          {selectedLab ? (
            <>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Computers in {selectedLab.name}</CardTitle>
                <Dialog open={isComputerDialogOpen} onOpenChange={setIsComputerDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => handleOpenComputerDialog()}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Computer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{currentComputer?.id ? "Edit Computer" : "Add New Computer"}</DialogTitle>
                      <DialogDescription>
                        {currentComputer?.id ? "Update computer details." : "Add a new computer to this lab."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                        <Label htmlFor="computer-name" className="sm:text-right">Name</Label>
                        <Input id="computer-name" value={currentComputer?.name || ''} onChange={e => setCurrentComputer(s => s ? { ...s, name: e.target.value } : null)} className="sm:col-span-3" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="sm:text-right">Status</Label>
                        <Select value={currentComputer?.status} onValueChange={value => setCurrentComputer(s => s ? { ...s, status: value as ComputerStatus } : null)}>
                          <SelectTrigger className="sm:col-span-3">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="functional">Functional</SelectItem>
                            <SelectItem value="faulty">Faulty</SelectItem>
                            <SelectItem value="in-use">In Use</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleSaveComputer}>{currentComputer?.id ? "Save Changes" : "Create Computer"}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="flex-grow overflow-y-auto">
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      {computerTable.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {computerTable.getRowModel().rows.length ? (
                        computerTable.getRowModel().rows.map((row) => (
                          <TableRow key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={computerColumns.length} className="h-24 text-center">
                            No computers in this lab.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="h-full flex items-center justify-center text-center text-muted-foreground p-6">
              <p>Select a lab from the left panel to manage its computers.</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}