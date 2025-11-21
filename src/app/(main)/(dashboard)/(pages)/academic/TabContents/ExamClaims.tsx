"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from '@/components/ui/card';

// --- API Service Imports ---
import { createExamClaim, CreateExamClaimRequest } from '@/services/api/ExamClaims/CreateExamClaim';
import { addClaim, AddClaimRequest } from '@/services/api/ExamClaims/AddClaim';

// --- Types ---

type ClaimStatus = "Pending" | "Approved" | "Rejected";

type Claim = {
  examName: string;
  examDate: string;
  venue: string;
  amount: number;
  status: ClaimStatus;
};

type NewClaim = Omit<Claim, 'status'>;

// Mock data
const claimsData: Claim[] = [
  {
    examName: "CS101 Midterm",
    examDate: "2025-10-15",
    venue: "Hall A",
    amount: 5000,
    status: "Approved",
  },
  {
    examName: "MA203 Final",
    examDate: "2025-11-20",
    venue: "Hall B",
    amount: 7500,
    status: "Pending",
  },
];

export function ExamClaims() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Header Form State
  const [name, setName] = useState('');
  const [faculty, setFaculty] = useState('');
  const [position, setPosition] = useState('');
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  // Claims Lists
  const [claims, setClaims] = useState<Claim[]>(claimsData); 
  const [newClaims, setNewClaims] = useState<NewClaim[]>([]); 

  // Popover inputs
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [venue, setVenue] = useState('');
  const [amount, setAmount] = useState('');

  const handleAddClaimToBatch = () => {
    if (examName && examDate && venue && amount) {
      console.log("DEBUG: Adding item to local batch:", { examName, examDate, venue, amount });
      setNewClaims([...newClaims, { examName, examDate, venue, amount: parseFloat(amount) }]);
      setExamName('');
      setExamDate('');
      setVenue('');
      setAmount('');
    } else {
      alert("Please fill all the fields to add a claim.");
    }
  };

  const handleRemoveClaim = (index: number) => {
    setNewClaims(newClaims.filter((_, i) => i !== index));
  };

  // --- MAIN SUBMISSION LOGIC ---
  const handleClaimSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // 1. Validation
    if (newClaims.length === 0) {
      alert("Please add at least one exam claim item before submitting.");
      return;
    }
    if (!name || !faculty || !position || !bankName || !branchName || !accountHolderName || !accountNumber) {
      alert("Please fill in all personal and bank details.");
      return;
    }

    setIsSubmitting(true);

    try {
      // --- Step 1: Create the Main Claim Header ---
      const claimHeaderData: CreateExamClaimRequest = {
        name,
        faculty,
        position,
        bankName,
        branchName,
        accountHolderName,
        accountNumber
      };

      console.log("DEBUG: Step 1 - Starting CreateExamClaim request...", claimHeaderData);
      
      const headerResponse = await createExamClaim(claimHeaderData);
      
      // Validation of response
      if (!headerResponse || !headerResponse.id) {
        console.error("DEBUG: Step 1 Failed - No ID returned", headerResponse);
        throw new Error("Server responded, but failed to provide a valid Claim ID.");
      }

      const newClaimId = headerResponse.id; 
      console.log(`DEBUG: Step 1 Success - Claim Header Created. NEW ID: ${newClaimId}`);

      // // --- Step 1.5: 5-Second Delay ---
      // console.log("DEBUG: ⏳ Waiting 5 seconds for backend to register the ID...");
    
      // console.log("DEBUG: ⏳ 5-second delay complete. Proceeding to add items.");

      // --- Step 2: Loop through items SEQUENTIALLY ---
      console.log(`DEBUG: Step 2 - Starting loop to add ${newClaims.length} items...`);
      
      let successCount = 0;
      
      for (let i = 0; i < newClaims.length; i++) {
        const item = newClaims[i];

        console.log(`DEBUG: Preparing to add Item ${i + 1}/${newClaims.length}:`, item);
        
        const itemRequest: AddClaimRequest = {
            examName: item.examName,
            examDate: item.examDate, // Now this will be a valid YYYY-MM-DD string
            venue: item.venue,
            amount: item.amount,
            claimId: newClaimId 
        };
        
        console.log(`DEBUG: Sending Item ${i + 1}/${newClaims.length} ("${item.examName}") linked to ClaimID ${newClaimId}...`);
        
        try {
            // Send request and wait for it to finish
            const itemResponse = await addClaim(itemRequest);
            console.log(`DEBUG: Item ${i + 1} Added Successfully. Response ID: ${itemResponse.id}`);
            successCount++;
        } catch (itemError: any) {
            // Detailed Error Logging
            console.error(`DEBUG: Failed to add Item ${i + 1}. Payload:`, itemRequest);
            console.error(`DEBUG: Backend Error Message:`, itemError.message);
            if (itemError.response) {
                console.error(`DEBUG: Backend Error Data:`, itemError.response.data);
            }
            
            throw new Error(`Failed to save exam "${item.examName}". The server rejected the data (likely invalid date or format). Check console.`);
        }
      }

      console.log(`DEBUG: Step 2 Success - All ${successCount} items added.`);

      // --- Step 3: UI Updates on Success ---
      alert("Exam claim and all items submitted successfully!");

      // Update local history table
      const submittedClaims: Claim[] = newClaims.map(claim => ({ ...claim, status: 'Pending' as const }));
      setClaims([...claims, ...submittedClaims]);

      // Clear all forms
      setNewClaims([]);
      setName('');
      setFaculty('');
      setPosition('');
      setBankName('');
      setBranchName('');
      setAccountHolderName('');
      setAccountNumber('');

    } catch (error: any) {
      console.error("DEBUG: Critical Submission Error:", error);
      alert(`Failed to submit claims: ${error.message || "Unknown error occurred"}`);
    } finally {
      setIsSubmitting(false);
      console.log("DEBUG: Submission process finished (finally block).");
    }
  };

  return (
    <div className="min-h-screen p-8 sm:p-12 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Payments</h1>
          <p className="text-lg">Manage your payments.</p>
        </div>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button className="px-6 py-3 rounded-md text-base font-medium transition-all duration-200 ease-in-out hover:bg-gray-700 bg-gray-800">
              Add New Claim
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[800px] p-4 rounded-md shadow-lg border">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none text-xl">Add Exam Details</h4>
                <p className="text-sm">
                  Enter your exam claim information below. You can add multiple claims.
                </p>
              </div>
              
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="name/code" className="text-right">
                    Exam Name/Code
                  </Label>
                  <Input id="name/code" placeholder="Enter Exam Name/Code" type="text" className="col-span-2 h-8" value={examName} onChange={(e) => setExamName(e.target.value)} />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Exam Date
                  </Label>
                  {/* CHANGED TYPE TO 'date' TO FIX 400 ERROR */}
                  <Input 
                    id="date" 
                    type="date" 
                    className="col-span-2 h-8" 
                    value={examDate} 
                    onChange={(e) => setExamDate(e.target.value)} 
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="venue" className="text-right">
                    Venue
                  </Label>
                  <Input id="venue" placeholder="Enter Exam Venue" type="text" className="col-span-2 h-8" value={venue} onChange={(e) => setVenue(e.target.value)} />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount
                  </Label>
                  <Input id="amount" placeholder="Enter Amount" type="number" className="col-span-2 h-8" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-between">
                <Button type="button" onClick={handleAddClaimToBatch} className="w-auto mt-4 rounded-md text-base font-medium transition-all duration-200 ease-in-out">
                  Add to List
                </Button>
                 <Button type="button" onClick={() => setIsPopoverOpen(false)} className="w-auto mt-4 rounded-md text-base font-medium transition-all duration-200 ease-in-out">
                  Done
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {newClaims.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Claims to be Submitted</h2>
          <Card>
            <CardContent className="p-6">
              {newClaims.map((claim, index) => (
                <div key={index} className="mb-4 p-4 border rounded-lg flex justify-between items-center">
                  <div>
                    <p><strong>Exam:</strong> {claim.examName}</p>
                    <p><strong>Date:</strong> {claim.examDate}</p>
                    <p><strong>Venue:</strong> {claim.venue}</p>
                    <p><strong>Amount:</strong> Rs. {claim.amount.toFixed(2)}</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleRemoveClaim(index)}>Remove</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-8 p-6 rounded-lg shadow-lg border">
        <h2 className="text-2xl font-semibold mb-4">Exam Claims Form</h2>
        <form onSubmit={handleClaimSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName" className="block mb-2">Name</Label>
            <Input id="fullName" type="text" placeholder="Enter full name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label className="block mb-2">Select Faculty</Label>
            <Select onValueChange={setFaculty} value={faculty}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a Faculty" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Faculty</SelectLabel>
                  <SelectItem value="Faculty of Law">Faculty of Law</SelectItem>
                  <SelectItem value="Faculty of Arts">Faculty of Arts</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="block mb-2">Select Position</Label>
            <Select onValueChange={setPosition} value={position}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Position</SelectLabel>
                  <SelectItem value="Chief">Chief</SelectItem>
                  <SelectItem value="Assistant">Assistant</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="BankName" className="block mb-2">Bank Name</Label>
            <Input id="BankName" type="text" placeholder="Enter Bank name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="BranchName" className="block mb-2">Branch Name</Label>
            <Input id="BranchName" type="text" placeholder="Enter Branch name" value={branchName} onChange={(e) => setBranchName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="AccountHolderName" className="block mb-2">Account Holder Name</Label>
            <Input id="AccountHolderName" type="text" placeholder="Enter Account Holder Name" value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="AccountNumber" className="block mb-2">Account Number</Label>
            <Input id="AccountNumber" type="text" placeholder="Enter Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
          </div>
          
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full mt-4 bg-blue-600 hover:bg-blue-700 rounded-md text-base font-medium transition-all duration-200 ease-in-out ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? "Submitting..." : "Submit All Claims"}
          </Button>
        </form>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Exam Claims History</h2>
        <div className="rounded-lg shadow-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam Name/Code</TableHead>
                <TableHead>Exam Date</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.map((claim, index) => (
                <TableRow key={index}>
                  <TableCell>{claim.examName}</TableCell>
                  <TableCell>{claim.examDate}</TableCell>
                  <TableCell>{claim.venue}</TableCell>
                  <TableCell>Rs. {claim.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium
                        ${claim.status === 'Approved' ? 'bg-green-100 text-green-800' : ''}
                        ${claim.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${claim.status === 'Rejected' ? 'bg-red-100 text-red-800' : ''}
                      `}
                    >
                      {claim.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}