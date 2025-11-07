'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MainContainer } from "./components/profile-main-container";
import { Button } from "@/components/ui/button";
import { Pencil, Save, X, ArrowLeft } from "lucide-react";
import { ProfileHeader } from "./components/ProfileHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChangePassword } from "./components/ChangePassword";
import { getUserData } from '@/services/api/UserProfile/getUserData';
import Link from "next/link";

// Animated/illustrated avatars for each role
const profileImages = {
  Admin: "https://cdn.jsdelivr.net/gh/realstoman/animated-svg-avatars@main/dist/svg/avatar-1.svg",
  Student: "https://cdn.jsdelivr.net/gh/realstoman/animated-svg-avatars@main/dist/svg/avatar-2.svg",
  Academic: "https://cdn.jsdelivr.net/gh/realstoman/animated-svg-avatars@main/dist/svg/avatar-3.svg",
  "Non-academic": "https://cdn.jsdelivr.net/gh/realstoman/animated-svg-avatars@main/dist/svg/avatar-4.svg",
};

// User data type definition
interface User {
  fullName: string;
  department: string;
  email: string;
  phone: string;
  role: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<User | null>(null);
  const [tempProfile, setTempProfile] = useState<User | null>(null);
  const [editPersonal, setEditPersonal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handlePasswordChangeSuccess = (message: string) => {
    setIsChangePasswordOpen(false);
    setSuccessMessage(message);
    setIsSuccessDialogOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userData = await getUserData();
        setProfile(userData);
        setTempProfile(userData);
        setError(null);
      } catch (_) {
        setError("Failed to fetch profile data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  type SectionType = "personal";

  const handleEdit = (section: SectionType) => {
    if (profile) {
      setTempProfile(profile);
    }
    if (section === "personal") setEditPersonal(true);
  };

  const handleCancel = (section: SectionType) => {
    if (profile) {
      setTempProfile(profile);
    }
    if (section === "personal") setEditPersonal(false);
  };

  const handleSave = (section: SectionType) => {
    if (tempProfile) {
      setProfile(tempProfile);
    }
    if (section === "personal") setEditPersonal(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (tempProfile) {
      setTempProfile({ ...tempProfile, [e.target.name]: e.target.value });
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen text-lg'>
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex justify-center items-center h-screen text-lg text-red-500'>
        Error: {error}
      </div>
    );
  }

  const role = profile?.role?.toLowerCase() || "admin";
  const profileImage = profileImages[profile?.role as keyof typeof profileImages] || profileImages.Admin;
  const Dashboard = "/" + role;

  return (
    <>
      <div className='p-4 md:p-8 min-h-screen'>
        <ProfileHeader />
        <MainContainer>
          <div className='flex items-center justify-between '>
            <Link href={Dashboard}>
              <Button variant='ghost' className='flex items-center gap-2'>
                <ArrowLeft className='w-4 h-4' /> Go to Dashboard
              </Button>
            </Link>
            <div className='flex-1 h-px bg-gray-200 dark:bg-gray-700 mx-4' />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mt-6'>
            {/* Left-hand side: Profile Card */}
            <Card className='bg-transparent border-0 shadow-none flex flex-col justify-between'>
              <CardHeader>
                <h3 className='text-2xl font-semibold tracking-tight'>
                  My Profile
                </h3>
              </CardHeader>
              <CardContent className='flex flex-col items-center p-4 md:p-6 pt-2 gap-4'>
                {/* Responsive profile image with fluid size adjustment */}
                <div className='relative w-20 h-20 md:w-24 md:h-24 lg:w-36 lg:h-36 xl:w-42 xl:h-42 rounded-full overflow-hidden border-4 border-primary/20 bg-gray-100 dark:bg-zinc-800 shadow-sm'>
                  <Image
                    src={profileImage}
                    alt='Profile'
                    className='object-cover'
                    fill
                  />
                  <Button
                    size='icon'
                    variant='ghost'
                    className='absolute bottom-1 right-1 p-1 rounded-full bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700'
                  >
                    <Pencil className='w-4 h-4 text-gray-600 dark:text-gray-300' />
                  </Button>
                </div>
                <div className='flex flex-col gap-1 text-center'>
                  <span className='text-xl md:text-2xl font-bold text-gray-800 dark:text-white'>{profile?.fullName}</span>
                  <span className='text-sm text-gray-500 dark:text-gray-400'>{profile?.role}</span>
                </div>
              </CardContent>
              {/* Added: Change Password Button */}
              <div className=' w-72 mx-auto'>
                <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                  <DialogTrigger asChild>
                    <Button variant='outline' className='w-full'>
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-[425px]'>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Enter your old and new password here. Click save when you&apos;re done.
                      </DialogDescription>
                    </DialogHeader>
                    <ChangePassword onSuccess={handlePasswordChangeSuccess} />
                  </DialogContent>
                </Dialog>
              </div>
            </Card>

            {/* Right-hand side: Personal Information Card */}
            <Card className='bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-md flex flex-col justify-between'>
              <CardHeader className='flex flex-row items-center justify-between md:px-8 md:py-2 md:px-16 pb-0' >
                <span className='text-lg font-bold'>Personal Information</span>
                {editPersonal ? (
                  <div className='flex gap-2'>
                    <Button size='sm' onClick={() => handleSave("personal")} className='gap-1'>
                      Save <Save className='w-4 h-4 ml-1' />
                    </Button>
                    <Button size='sm' variant='ghost' onClick={() => handleCancel("personal")} className='gap-1'>
                      Cancel <X className='w-4 h-4 ml-1' />
                    </Button>
                  </div>
                ) : (
                  <Button size='sm' variant='outline' className='gap-1' onClick={() => handleEdit("personal")}>
                    Edit <Pencil className='w-4 h-4 ml-1' />
                  </Button>
                )}
              </CardHeader>
              {/* Corrected: Removed extra wrapper div and adjusted padding */}
              <CardContent className='flex flex-col gap-4 p-4 md:py-2 md:px-16 pt-0 flex-1'>
                <div className='flex justify-between items-center py-2 border-b last:border-b-0 border-gray-100 dark:border-zinc-800'>
                  <div className='text-sm text-gray-500 dark:text-gray-400'>Full Name</div>
                  {editPersonal ? (
                    <input
                      name='fullName'
                      value={tempProfile?.fullName || ''}
                      onChange={handleChange}
                      className='w-2/3 rounded-md px-3 py-2 text-left bg-gray-100 dark:bg-zinc-800 border-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200'
                    />
                  ) : (
                    <div className='font-medium text-gray-800 dark:text-white'>{profile?.fullName}</div>
                  )}
                </div>
                <div className='flex justify-between items-center py-2 border-b last:border-b-0 border-gray-100 dark:border-zinc-800'>
                  <div className='text-sm text-gray-500 dark:text-gray-400'>Department</div>
                  {editPersonal ? (
                    <input
                      name='department'
                      value={tempProfile?.department || ''}
                      onChange={handleChange}
                      className='w-2/3 rounded-md px-3 py-2 text-left bg-gray-100 dark:bg-zinc-800 border-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200'
                    />
                  ) : (
                    <div className='font-medium text-gray-800 dark:text-white'>{profile?.department}</div>
                  )}
                </div>
                <div className='flex justify-between items-center py-2 border-b last:border-b-0 border-gray-100 dark:border-zinc-800'>
                  <div className='text-sm text-gray-500 dark:text-gray-400'>Email Address</div>
                  <div className='font-medium text-gray-800 dark:text-white'>{profile?.email}</div>
                </div>
                <div className='flex justify-between items-center py-2 border-b last:border-b-0 border-gray-100 dark:border-zinc-800'>
                  <div className='text-sm text-gray-500 dark:text-gray-400'>Phone Number</div>
                  {editPersonal ? (
                    <input
                      name='phone'
                      value={tempProfile?.phone || ''}
                      onChange={handleChange}
                      className='w-2/3 rounded-md px-3 py-2 text-left bg-gray-100 dark:bg-zinc-800 border-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200'
                    />
                  ) : (
                    <div className='font-medium text-gray-800 dark:text-white'>{profile?.phone}</div>
                  )}
                </div>
                <div className='flex justify-between items-center py-2'>
                  <div className='text-sm text-gray-500 dark:text-gray-400'>User Role</div>
                  <div className='font-medium text-gray-800 dark:text-white'>{profile?.role}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </MainContainer>
      </div>
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
          <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                  <DialogTitle>Success</DialogTitle>
                  <DialogDescription>
                      {successMessage}
                  </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                  <Button onClick={() => {
                      setIsSuccessDialogOpen(false);
                      window.location.reload();
                  }}>Close</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </>
  );
}
