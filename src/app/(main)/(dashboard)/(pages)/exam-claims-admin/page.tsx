"use client"
import { useEffect, useState } from "react";
import { DashboardPageProviders } from "../../providers/DashboardPageProviders";
import { getAllExamClaimItems, ExamClaimItem } from "@/services/api/ExamClaims/GetAllExamClaimItems";

// Tabs
import { Overview } from "./TabContents/Overview";
import { NewClaim } from "./TabContents/NewClaims";
import { Approved } from "./TabContents/Approved";
import { Rejected } from "./TabContents/Rejected";

export default function ExamClaimsAdmin() {
  const [claims, setClaims] = useState<ExamClaimItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllExamClaimItems();
        setClaims(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load exam claims.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateClaimStatus = (claimId: number, newStatus: "PENDING" | "APPROVED" | "REJECTED") => {
    setClaims(prevClaims =>
      prevClaims.map(claim =>
        claim.id === claimId ? { ...claim, status: { ...claim.status, status: newStatus } } : claim
      )
    );
  };

  const menuItemsExamClaimsAdmin = [
    { title: "Overview", url: "#", icon: "Overview", content: "Overview" },
    { title: "New Claim", url: "#", icon: "NewClaim", content: "NewClaim" },
    { title: "Approved", url: "#", icon: "Approved", content: "Approved" },
    { title: "Rejected", url: "#", icon: "Rejected", content: "Rejected" },
  ];

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <DashboardPageProviders menuItems={menuItemsExamClaimsAdmin}>
      <div title="Overview"><Overview claims={claims} /></div>
      <div title="New Claim"><NewClaim claims={claims} handleUpdateClaimStatus={handleUpdateClaimStatus} /></div>
      <div title="Approved"><Approved claims={claims} /></div>
      <div title="Rejected"><Rejected claims={claims} /></div>
    </DashboardPageProviders>
  );
}