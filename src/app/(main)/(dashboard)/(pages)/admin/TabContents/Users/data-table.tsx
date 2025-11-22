"use client"

import * as React from "react"
import { TfiReload } from "react-icons/tfi"

// --- IMPORTS FOR DATA FETCHING ---
import { retrieveUsersByPage, User } from '@/services/api/User/retrieveUsersPagination'
import { Payment } from "./columns" // Import Payment type
// ---

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// --- HELPER FUNCTION ---
function mapUserToPayment(user: User): Payment {
  return {
    id: user.id.toString(),
    name: user.fullName,
    email: user.email,
    role: user.role as "Admin" | "Student" | "Academic" | "Non-academic",
    action: undefined,
  }
}
// ---

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
}

export function DataTable<TData, TValue>({ columns }: DataTableProps<TData, TValue>) {
  // --- STATE FOR DATA AND PAGINATION ---
  const [data, setData] = React.useState<TData[]>([])
  const [currentPage, setCurrentPage] = React.useState(1)
  const [haveMoreUsers, setHaveMoreUsers] = React.useState(false)
  // ---

  const [rowSelection, setRowSelection] = React.useState({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])

  // --- EFFECT TO FETCH DATA ---
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`Fetching data for page ${currentPage}...`)
        const apiResponse = await retrieveUsersByPage(currentPage)

        if (apiResponse && apiResponse.users) {
          const mappedData = apiResponse.users.map(mapUserToPayment)
          setData(mappedData as TData[])
          setHaveMoreUsers(apiResponse.haveMoreUsers)
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error)
        setData([])
        setHaveMoreUsers(false)
      }
    }

    fetchData()
  }, [currentPage])
  // ---

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between py-4 gap-2">
        <Input
          placeholder="Search by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />

        <Input
          placeholder="Filter emails..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("email")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />

        <div className="flex items-center gap-2">
          <Select
            value={(table.getColumn("role")?.getFilterValue() as string) ?? ""}
            onValueChange={(value) => table.getColumn("role")?.setFilterValue(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by role" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectLabel>Role</SelectLabel>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Student">Student</SelectItem>
                <SelectItem value="Academic">Academic</SelectItem>
                <SelectItem value="Non-academic">Non-academic</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            onClick={() => table.getColumn("role")?.setFilterValue("")}
          >
            <TfiReload className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- PAGINATION CONTROLS --- */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
          <span className="ml-4">Page {currentPage}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((page) => page - 1)}
          disabled={currentPage <= 1}
        >
          Previous
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((page) => page + 1)}
          disabled={!haveMoreUsers}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
