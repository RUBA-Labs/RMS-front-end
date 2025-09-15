// components/ui/overview.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


interface LabStatus {
  name: string;
  status: 'available' | 'occupied' | 'maintenance';
  computers: number;
  inUse: number;
}

const labData: LabStatus[] = [
  { name: "Lab A1", status: "available", computers: 30, inUse: 5 },
  { name: "Lab B2", status: "occupied", computers: 25, inUse: 25 },
  { name: "Lab C3", status: "maintenance", computers: 20, inUse: 0 },
  { name: "Lab D4", status: "available", computers: 35, inUse: 12 },
];

export function Overview() {
  const getStatusBadge = (status: LabStatus['status']) => {
    switch (status) {
      case 'available':
        return <Badge variant="secondary" className="bg-green-500 text-white hover:bg-green-500">Available</Badge>;
      case 'occupied':
        return <Badge variant="secondary" className="bg-red-500 text-white hover:bg-red-500">Occupied</Badge>;
      case 'maintenance':
        return <Badge variant="secondary" className="bg-yellow-500 text-white hover:bg-yellow-500">In Maintenance</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Computer Lab Overview</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {labData.map((lab, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {lab.name}
              </CardTitle>
              {getStatusBadge(lab.status)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lab.inUse} / {lab.computers}
              </div>
              <p className="text-xs text-muted-foreground">
                {lab.computers - lab.inUse} computers available
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}