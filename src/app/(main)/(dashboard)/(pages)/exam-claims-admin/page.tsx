"use client"
import { useState } from "react";
import { DashboardPageProviders } from "../../providers/DashboardPageProviders"

//tabs
import { Overview } from "./TabContents/Overview";
import { NewClaim } from "./TabContents/NewClaims";
import { Approved } from "./TabContents/Approved";
import { Rejected } from "./TabContents/Rejected";  

interface Claim {
  examName: string;
  examDate: string;
  venue: string;
  amount: number;
  status: "Pending" | "Approved" | "Rejected";
  fullName: string;
  faculty: string;
  position: string;
  bankName: string;
  branchName: string;
  accountHolderName: string;
  accountNumber: string;
}

const initialClaims: Claim[] = [
    {
    examName: "Mathematics 101",
    examDate: "2023-01-15",
    venue: "Room A1",
    amount: 1500.00,
    status: "Approved",
    fullName: "Dr. John Doe",
    faculty: "Faculty of Science",
    position: "Senior Lecturer",
    bankName: "Bank of Colombo",
    branchName: "Main Branch",
    accountHolderName: "J. Doe",
    accountNumber: "123456789",
  },
  {
    examName: "Physics 201",
    examDate: "2023-02-20",
    venue: "Room B2",
    amount: 2000.00,
    status: "Pending",
    fullName: "Dr. Jane Smith",
    faculty: "Faculty of Science",
    position: "Professor",
    bankName: "People's Bank",
    branchName: "Kandy Branch",
    accountHolderName: "J. Smith",
    accountNumber: "987654321",
  },
  {
    examName: "Chemistry 301",
    examDate: "2023-03-10",
    venue: "Room C3",
    amount: 2500.00,
    status: "Rejected",
    fullName: "Mr. Peter Jones",
    faculty: "Faculty of Arts",
    position: "Lecturer",
    bankName: "Sampath Bank",
    branchName: "Galle Branch",
    accountHolderName: "P. Jones",
    accountNumber: "456789123",
  },
  {
    examName: "Biology 101",
    examDate: "2023-04-05",
    venue: "Room D4",
    amount: 1800.00,
    status: "Pending",
    fullName: "Ms. Mary Williams",
    faculty: "Faculty of Medicine",
    position: "Assistant Lecturer",
    bankName: "Commercial Bank",
    branchName: "Jaffna Branch",
    accountHolderName: "M. Williams",
    accountNumber: "321654987",
  },
  {
    examName: "History 202",
    examDate: "2023-05-12",
    venue: "Hall E5",
    amount: 1200.00,
    status: "Approved",
    fullName: "Dr. David Brown",
    faculty: "Faculty of Arts",
    position: "Senior Professor",
    bankName: "Hatton National Bank",
    branchName: "Nuwara Eliya Branch",
    accountHolderName: "D. Brown",
    accountNumber: "789123456",
  },
]

export default function ExamClaimsAdmin() {
  const [claims, setClaims] = useState<Claim[]>(initialClaims);

  const handleUpdateClaimStatus = (claimToUpdate: Claim, newStatus: "Pending" | "Approved" | "Rejected") => {
    setClaims(claims.map(claim => 
      claim.examName === claimToUpdate.examName && claim.accountNumber === claimToUpdate.accountNumber 
        ? { ...claim, status: newStatus } 
        : claim
    ));
  };

   const menuItemsExamClaimsAdmin = [
    { title: "Overview", url: "#", icon: "Overview", content: "Overview" },
    { title: "New Claim", url: "#", icon: "NewClaim", content: "NewClaim" },
    { title: "Approved", url: "#", icon: "Approved", content: "Approved" },
    { title: "Rejected", url: "#", icon: "Rejected", content: "Rejected" },
  ];

  return (
    <DashboardPageProviders menuItems={menuItemsExamClaimsAdmin}>
      <div title="Overview"><Overview claims={claims} /></div>
      <div title="New Claim"><NewClaim claims={claims} handleUpdateClaimStatus={handleUpdateClaimStatus} /></div>
      <div title="Approved"><Approved claims={claims} /></div>
      <div title="Rejected"><Rejected claims={claims} /></div>
    </DashboardPageProviders>
  );
}