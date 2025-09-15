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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Claim = {
  examName: string;
  examDate: string;
  venue: string;
  amount: number;
  status: "Pending" | "Approved" | "Rejected";
};

type NewClaim = Omit<Claim, 'status'>;

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
  {
    examName: "PHY105 Quiz",
    examDate: "2025-09-30",
    venue: "Room 301",
    amount: 2500,
    status: "Rejected",
  },
];

export function ExamClaims() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [name, setName] = useState('');
  const [faculty, setFaculty] = useState('');
  const [position, setPosition] = useState('');
  const [claims, setClaims] = useState<Claim[]>(claimsData);
  const [newClaims, setNewClaims] = useState<NewClaim[]>([]);

  // State for popover inputs
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [venue, setVenue] = useState('');
  const [amount, setAmount] = useState('');

  const handleAddClaimToBatch = () => {
    if (examName && examDate && venue && amount) {
      setNewClaims([...newClaims, { examName, examDate, venue, amount: parseFloat(amount) }]);
      // Clear fields for next entry
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

  const handleClaimSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (newClaims.length === 0) {
      alert("Please add at least one claim before submitting.");
      return;
    }
    console.log("Exam claim submitted!", { name, faculty, position, claims: newClaims });
    const claimsToSubmit: Claim[] = newClaims.map(claim => ({ ...claim, status: 'Pending' as const }));
    setClaims([...claims, ...claimsToSubmit]);
    
    // Clear the form
    setNewClaims([]);
    setName('');
    setFaculty('');
    setPosition('');
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
                  <Input id="date" placeholder="MM/DD/YYYY" type="text" className="col-span-2 h-8" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
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
                  <SelectItem value="faculty1">Faculty of Law</SelectItem>
                  <SelectItem value="faculty2">Faculty of Arts</SelectItem>
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
                  <SelectItem value="position1">Chief</SelectItem>
                  <SelectItem value="position2">Assistant</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 rounded-md text-base font-medium transition-all duration-200 ease-in-out">
            Submit All Claims
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
