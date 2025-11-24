'use client';

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { retrieveAllLabs, LabDto } from "@/services/api/ComputerLabs/retrieve_all_labs";
import { retrieveAllLabSessions, LabSessionDto } from "@/services/api/LabSessions/retrieve_all_lab_sessions";
import { format } from "date-fns";

type Lab = LabDto;

interface LabStatus {
  id: string;
  name: string;
  status: 'available' | 'occupied';
  capacity: number;
  computersWorking: number;
}

export function Overview() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [sessions, setSessions] = useState<LabSessionDto[]>([]);
  const [loadingLabs, setLoadingLabs] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const labsResp = await retrieveAllLabs();
        setLabs(labsResp);
      } catch {
        setError("Failed to load labs.");
      } finally {
        setLoadingLabs(false);
      }
    };
    fetchLabs();
  }, []);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const sessionsResp = await retrieveAllLabSessions();
        setSessions(sessionsResp);
      } catch {
        setError("Failed to load sessions.");
      } finally {
        setLoadingSessions(false);
      }
    };
    fetchSessions();
  }, []);

  const labStatusList: LabStatus[] = labs.map(lab => {
    const working = lab.computersWorking ?? 0;
    const capacity = lab.capacity ?? 0;
    const status: LabStatus['status'] = working >= capacity ? "occupied" : "available";

    return {
      id: lab.id,
      name: lab.name,
      status,
      capacity,
      computersWorking: working,
    };
  });

  // Summary from sessions - total and today's
  const today = new Date();
  const todayString = format(today, "yyyy-MM-dd");
  const totalSessions = sessions.length;
  const todaysSessions = sessions.filter(s => s.sessionDate === todayString).length;

  if (error) {
    return <div className="p-6 text-destructive">{error}</div>;
  }

  if (loadingLabs || loadingSessions) {
    return <div className="p-6">Loading data...</div>;
  }

  return (
    <div className="p-6 space-y-6">

      <h2 className="text-xl font-semibold">Computer Lab Overview</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {labStatusList.map(lab => (
          <Card key={lab.id}>
            <CardHeader className="flex justify-between items-center pb-2">
              <CardTitle className="text-sm font-medium">{lab.name}</CardTitle>
              <Badge
                variant={lab.status === "available" ? "secondary" : "destructive"}
                className={lab.status === "available" ? "bg-green-500 text-white" : "bg-red-500 text-white"}
              >
                {lab.status.charAt(0).toUpperCase() + lab.status.slice(1)}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {lab.computersWorking} / {lab.capacity}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-xl font-semibold">Session Scheduling Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <Card>
          <CardHeader>
            <CardTitle>Total Scheduled Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSessions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sessions Scheduled Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todaysSessions}</div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
