import { columns, Payment } from "./columns"
import { DataTable } from "./data-table"

async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    {
        id: "728ed52f",
        name: "John Doe",
        email: "m@example.com",
        role: "Admin",
        action: undefined
    },
    {
        id: "728ed52f",
        name: "John Doe",
        email: "m@example.lk",
        role: "Admin",
        action: undefined
    },
    {
        id: "728ed52f",
        name: "John Doe",
        email: "m@example.com",
        role: "Admin",
        action: undefined
    },
    {
        id: "728ed52f",
        name: "John Doe",
        email: "m@example.com",
        role: "Admin",
        action: undefined
    },
    {
        id: "728ed52f",
        name: "John Doe",
        email: "m@example.lk",
        role: "Admin",
        action: undefined
    },
    {
        id: "728ed52f",
        name: "John Doe",
        email: "m@example.com",
        role: "Admin",
        action: undefined
    },
    {
        id: "728ed52f",
        name: "John Doe",
        email: "m@example.com",
        role: "Admin",
        action: undefined
    },
    {
        id: "728ed52f",
        name: "Kane ",
        email: "m@example.lk",
        role: "Admin",
        action: undefined
    },
    {
        id: "728ed52f",
        name: "John Doe",
        email: "m@example.com",
        role: "Admin",
        action: undefined
    },
    {
        id: "728ed52f",
        name: "John Doe",
        email: "m@example.com",
        role: "Admin",
        action: undefined
    },
    {
        id: "728ed52f",
        name: "John Doe",
        email: "m@example.lk",
        role: "Admin",
        action: undefined
    },
    {
        id: "728ed52f",
        name: "John Doe",
        email: "m@example.com",
        role: "Admin",
        action: undefined
    },
    {
        id: "728ed52f",
        name: "John Doe",
        email: "m@example.com",
        role: "Admin",
        action: undefined
    },
    {
        id: "728ed52f",
        name: "John Doe",
        email: "m@example.lk",
        role: "Admin",
        action: undefined
    },
    {
        id: "728ed52f",
        name: "John Doe",
        email: "m@example.com",
        role: "Student",
        action: undefined
    },
    // ...
  ]
}

export default async function Users() {
  const data = await getData()

  return (
    <div className="container mx-auto py-2">
      <DataTable columns={columns} data={data} />
    </div>
  )
}