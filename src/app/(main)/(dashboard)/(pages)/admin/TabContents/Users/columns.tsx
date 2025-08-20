"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { ColumnDef } from "@tanstack/react-table"
import { FaEdit, FaTrash } from 'react-icons/fa';
import { MoreHorizontal } from "lucide-react"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
    id: string
    name: string
    email: string
    role: "Admin" | "Student" | "Academic" | "Non-academic" ; // Defining roles as a union type
    action: React.ReactNode;

}

export const columns: ColumnDef<Payment>[] = [
    {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value:boolean) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
},

    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "email",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "role",
        header: "Role",
    },

    {
        accessorKey: "action",
        header: "Action",

        cell: ({ row }) => {
            const payment = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center">
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(payment.id)}
                        >
                            Copy user ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>User Info</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Edit
                            <div className="flex items-center gap-2">
                                {/* Edit Button */}
                                <button
                                    onClick={() => {
                                        // Implement your edit logic here, e.g., open a modal
                                        console.log("Editing user:", row.original.name);
                                    }}
                                    className="text-blue-500 hover:text-blue-700"
                                    aria-label="Edit user"
                                >
                                    <FaEdit className="h-4 w-4" />
                                </button></div>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Delete
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        // Implement your delete logic here, e.g., show a confirmation dialog
                                        console.log("Deleting user:", row.original.name);
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                    aria-label="Delete user"
                                >
                                    <FaTrash className="h-4 w-4" />
                                </button>
                               
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]