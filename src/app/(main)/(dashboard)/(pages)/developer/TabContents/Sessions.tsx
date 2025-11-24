"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getUserSessions, UserSession } from "@/services/api/Session/get_user_sessions";
import { logoutSpecificDevices } from "@/services/api/Session/logout_specific_device";
import { logoutAllDevices } from "@/services/api/Session/logout_all_device";

export function Sessions() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const userSessions = await getUserSessions();
      setSessions(userSessions);
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutSelected = async () => {
    await logoutSpecificDevices(selectedSessions);
    setSelectedSessions([]);
    fetchSessions();
  };

  const handleLogoutAll = async () => {
    await logoutAllDevices();
    fetchSessions();
  };
  
  const handleSelectSession = (sessionId: string) => {
    setSelectedSessions((prev) =>
      prev.includes(sessionId)
        ? prev.filter((id) => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  if (loading) {
    return <p>Loading sessions...</p>;
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <Button onClick={handleLogoutSelected} disabled={selectedSessions.length === 0}>
          Logout Selected
        </Button>
        <Button onClick={handleLogoutAll} variant="destructive">
          Logout All Devices
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Device</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Last Used</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell>
                <Checkbox
                  checked={selectedSessions.includes(session.id)}
                  onCheckedChange={() => handleSelectSession(session.id)}
                />
              </TableCell>
              <TableCell>{session.deviceName}</TableCell>
              <TableCell>{session.ipAddress}</TableCell>
              <TableCell>{new Date(session.lastUsedAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}