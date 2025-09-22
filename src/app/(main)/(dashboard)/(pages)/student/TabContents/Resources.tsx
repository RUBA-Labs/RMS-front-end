// components/ui/resources-management.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PlusCircle, Trash2, Edit, XCircle } from "lucide-react";
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
import { v4 as uuidv4 } from 'uuid';

// --- 1. New Data and Types ---
// A more generic status system for all resources
type ResourceStatus = "functional" | "faulty" | "in-use" | "reserved" | "unavailable";

// Represents a category like "Venues" or "Equipment"
interface ResourceCategory {
  id: string;
  name: string;
  description: string;
}

// Represents a specific resource item
interface ResourceItem {
  id: string;
  name: string;
  categoryId: string;
  status: ResourceStatus;
  // Optional properties for different categories
  location?: string;
  capacity?: number;
}

// --- 2. Simulating a Service Layer for Resources ---
const resourceService = {
  categories: [
    { id: "cat-venues", name: "Venues", description: "Lecture theatres, classrooms, etc." },
    { id: "cat-equipment", name: "Equipment", description: "Computers, projectors, microphones, etc." },
  ] as ResourceCategory[],

  items: [
    // Venue Items
    { id: "item-a1", name: "Lecture Theatre A1", categoryId: "cat-venues", status: "functional", location: "Building 3, Floor 2", capacity: 25 },
    { id: "item-b2", name: "Multimedia Room B2", categoryId: "cat-venues", status: "reserved", location: "Building 5, Floor 1", capacity: 30 },
    // Equipment Items
    { id: "item-c1", name: "PC-A1-01", categoryId: "cat-equipment", status: "functional" },
    { id: "item-c2", name: "Projector-B5", categoryId: "cat-equipment", status: "faulty" },
    { id: "item-c3", name: "PC-A1-03", categoryId: "cat-equipment", status: "in-use" },
  ] as ResourceItem[],

  async getCategories(): Promise<ResourceCategory[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return this.categories;
  },

  async getItemsByCategoryId(categoryId: string): Promise<ResourceItem[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return this.items.filter(item => item.categoryId === categoryId);
  },

  async addItem(item: Omit<ResourceItem, 'id'>): Promise<ResourceItem> {
    await new Promise(resolve => setTimeout(resolve, 50));
    const newItem = { ...item, id: uuidv4() };
    this.items.push(newItem);
    return newItem;
  },

  async updateItem(item: ResourceItem): Promise<ResourceItem> {
    await new Promise(resolve => setTimeout(resolve, 50));
    const index = this.items.findIndex(i => i.id === item.id);
    if (index !== -1) {
      this.items[index] = item;
    }
    return item;
  },

  async deleteItem(itemId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 50));
    this.items = this.items.filter(i => i.id !== itemId);
  }
};

// --- 3. Main Container Component ---
export function Resources() {
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Fetch initial data once on mount
  useState(() => {
    resourceService.getCategories().then(cats => {
      setCategories(cats);
      // Select the first category by default if it exists
      if (cats.length > 0) {
        setSelectedCategoryId(cats[0].id);
      }
    });
  });

  const selectedCategory = useMemo(() => categories.find(c => c.id === selectedCategoryId), [categories, selectedCategoryId]);

  const refreshCategories = useCallback(() => {
    resourceService.getCategories().then(setCategories);
  }, []);

  const handleSelectCategory = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold">Resource Management</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-100px)]">
        <CategoryList 
          categories={categories} 
          selectedCategoryId={selectedCategoryId} 
          onSelectCategory={handleSelectCategory}
          refreshCategories={refreshCategories}
        />
        <ResourceManagement 
          selectedCategory={selectedCategory} 
        />
      </div>
    </div>
  );
}

// --- 4. Modularized Components ---

// Component to display and manage the list of resource categories
function CategoryList({ categories, selectedCategoryId, onSelectCategory, refreshCategories }: {
  categories: ResourceCategory[],
  selectedCategoryId: string | null,
  onSelectCategory: (id: string) => void,
  refreshCategories: () => void
}) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Resource Categories</CardTitle>
        {/* Add/Edit Category dialog can be added here */}
      </CardHeader>
      <CardContent className="space-y-2 flex-grow overflow-y-auto">
        {categories.map(category => (
          <div
            key={category.id}
            className={cn(
              "p-4 border rounded-md cursor-pointer transition-colors hover:bg-muted/50",
              selectedCategoryId === category.id ? "bg-muted border-primary" : "bg-background"
            )}
            onClick={() => onSelectCategory(category.id)}
          >
            <div className="flex justify-between items-center">
              <p className="font-semibold text-lg">{category.name}</p>
            </div>
            <p className="text-sm text-muted-foreground">{category.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Component to manage resource items within a selected category
function ResourceManagement({ selectedCategory }: {
  selectedCategory: ResourceCategory | undefined
}) {
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Omit<ResourceItem, 'id' | 'categoryId'> & { id?: string } | null>(null);

  // Fetch items whenever the selected category changes
  useState(() => {
    if (selectedCategory) {
      resourceService.getItemsByCategoryId(selectedCategory.id).then(setItems);
    }
  });
  
  const refreshItems = useCallback(() => {
    if (selectedCategory) {
      resourceService.getItemsByCategoryId(selectedCategory.id).then(setItems);
    }
  }, [selectedCategory]);

  const handleOpenItemDialog = useCallback((item?: ResourceItem) => {
    setCurrentItem(item ? item : { name: "", status: "functional" });
    setIsItemDialogOpen(true);
  }, []);

  const handleSaveItem = useCallback(async () => {
    if (!currentItem || !selectedCategory) return;
    if (currentItem.id) {
      await resourceService.updateItem({ ...currentItem, categoryId: selectedCategory.id } as ResourceItem);
    } else {
      await resourceService.addItem({ ...currentItem, categoryId: selectedCategory.id });
    }
    setIsItemDialogOpen(false);
    refreshItems();
  }, [currentItem, selectedCategory, refreshItems]);

  const handleDeleteItem = useCallback(async (itemId: string) => {
    await resourceService.deleteItem(itemId);
    refreshItems();
  }, [refreshItems]);

  const itemColumns: ColumnDef<ResourceItem>[] = useMemo(() => [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "location", header: "Location", cell: ({ row }) => row.original.location || "-" },
    { accessorKey: "capacity", header: "Capacity", cell: ({ row }) => row.original.capacity || "-" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const color = status === "functional" ? "bg-green-500" : status === "faulty" ? "bg-red-500" : status === "in-use" ? "bg-yellow-500" : "bg-gray-500";
        return <Badge className={cn("text-white", color)}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => handleOpenItemDialog(row.original)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(row.original.id)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ], [handleOpenItemDialog, handleDeleteItem]);

  const itemTable = useReactTable({
    data: items || [],
    columns: itemColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className="flex flex-col h-full">
      {selectedCategory ? (
        <>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Items in {selectedCategory.name}</CardTitle>
            <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenItemDialog()}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{currentItem?.id ? "Edit Item" : "Add New Item"}</DialogTitle>
                  <DialogDescription>
                    {currentItem?.id ? "Update item details." : "Add a new item to this category."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="item-name" className="sm:text-right">Name</Label>
                    <Input id="item-name" value={currentItem?.name || ''} onChange={e => setCurrentItem(s => s ? { ...s, name: e.target.value } : null)} className="sm:col-span-3" />
                  </div>
                  {/* Conditionally render fields based on category */}
                  {selectedCategory.id === "cat-venues" && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                        <Label htmlFor="location" className="sm:text-right">Location</Label>
                        <Input id="location" value={currentItem?.location || ''} onChange={e => setCurrentItem(s => s ? { ...s, location: e.target.value } : null)} className="sm:col-span-3" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                        <Label htmlFor="capacity" className="sm:text-right">Capacity</Label>
                        <Input id="capacity" type="number" value={currentItem?.capacity || 0} onChange={e => setCurrentItem(s => s ? { ...s, capacity: parseInt(e.target.value) || 0 } : null)} className="sm:col-span-3" />
                      </div>
                    </>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="sm:text-right">Status</Label>
                    <Select value={currentItem?.status} onValueChange={value => setCurrentItem(s => s ? { ...s, status: value as ResourceStatus } : null)}>
                      <SelectTrigger className="sm:col-span-3">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="functional">Functional</SelectItem>
                        <SelectItem value="faulty">Faulty</SelectItem>
                        <SelectItem value="in-use">In Use</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                        <SelectItem value="unavailable">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSaveItem}>{currentItem?.id ? "Save Changes" : "Create Item"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto">
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  {itemTable.getHeaderGroups().map((headerGroup) => (
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
                  {itemTable.getRowModel().rows.length ? (
                    itemTable.getRowModel().rows.map((row) => (
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
                      <TableCell colSpan={itemColumns.length} className="h-24 text-center">
                        No items in this category.
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
          <p>Select a category from the left panel to manage its resources.</p>
        </CardContent>
      )}
    </Card>
  );
}