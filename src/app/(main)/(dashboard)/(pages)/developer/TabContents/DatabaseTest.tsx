"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { getTableData } from "@/services/api/Developer/database";

export function DatabaseTest() {
  const [tableName, setTableName] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchData = async () => {
    if (!tableName) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getTableData(tableName);
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          type="text"
          placeholder="Enter table name"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
        />
        <Button onClick={handleFetchData} disabled={loading}>
          {loading ? "Loading..." : "Fetch Data"}
        </Button>
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {results.length > 0 && (
        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              {Object.keys(results[0]).map((key) => (
                <TableHead key={key}>{key}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((row, index) => (
              <TableRow key={index}>
                {Object.values(row).map((value: any, i) => (
                  <TableCell key={i}>{String(value)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}