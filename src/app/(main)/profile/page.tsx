"use client";

import Link from "next/link"; // Import Link from Next.js
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MainContainer } from "./components/profile-main-container";
import { Button } from "@/components/ui/button";
import { Pencil, Save, X, ArrowLeft } from "lucide-react";
import { ProfileHeader } from "./components/ProfileHeader";
import { LogOut } from "lucide-react"; // Import LogOut icon

// Animated/illustrated avatars for each role
const profileImages = {
  Admin: "https://cdn.jsdelivr.net/gh/realstoman/animated-svg-avatars@main/dist/svg/avatar-1.svg",
  Student: "https://cdn.jsdelivr.net/gh/realstoman/animated-svg-avatars@main/dist/svg/avatar-2.svg",
  Academic: "https://cdn.jsdelivr.net/gh/realstoman/animated-svg-avatars@main/dist/svg/avatar-3.svg",
  "Non-academic": "https://cdn.jsdelivr.net/gh/realstoman/animated-svg-avatars@main/dist/svg/avatar-4.svg",
};

export default function Profile() {
  const role = "admin";
  const profileImage = profileImages[role] || profileImages.Admin;
  const Dashboard = "/" + role;

  const [editPersonal, setEditPersonal] = useState(false);
  const [editAddress, setEditAddress] = useState(false);

  const [profile, setProfile] = useState({
    fullName: "Natashia Khaleira",
    department: "Sinhala",
    email: "info@binary-fusion.com",
    phone: "(+62) 821 2554-5846",
    role: role,
    country: "United Kingdom",
    city: "Leeds, East London",
    postal: "ERT 1254",
  });

  const [tempProfile, setTempProfile] = useState(profile);

  const handleEdit = (section) => {
    setTempProfile(profile);
    if (section === "personal") setEditPersonal(true);
    if (section === "address") setEditAddress(true);
  };

  const handleCancel = (section) => {
    setTempProfile(profile);
    if (section === "personal") setEditPersonal(false);
    if (section === "address") setEditAddress(false);
  };

  const handleSave = (section) => {
    setProfile(tempProfile);
    if (section === "personal") setEditPersonal(false);
    if (section === "address") setEditAddress(false);
  };

  const handleChange = (e) => {
    setTempProfile({ ...tempProfile, [e.target.name]: e.target.value });
  };

  return (
    <>
      <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
        <ProfileHeader />
        <MainContainer>
          <div className="flex items-center justify-between ">
            <Link href={Dashboard}><Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Go to Dashboard
            </Button>
            </Link>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700 mx-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            {/* Left-hand side: Profile Card */}
            <Card className="bg-transparent border-0 shadow-none flex flex-col justify-between">
              <CardHeader>
                <h3 className="text-2xl font-semibold tracking-tight">
                  My Profile
                </h3>
              </CardHeader>
              <CardContent className="flex flex-col items-center p-4 md:p-6 pt-2 gap-4">
                {/* Responsive profile image with fluid size adjustment */}
                <div className="relative w-20 h-20 md:w-24 md:h-24 lg:w-36 lg:h-36 xl:w-42 xl:h-42 rounded-full overflow-hidden border-4 border-primary/20 bg-gray-100 dark:bg-zinc-800 shadow-sm">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="object-cover w-full h-full"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute bottom-1 right-1 p-1 rounded-full bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700"
                  >
                    <Pencil className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </Button>
                </div>
                <div className="flex flex-col gap-1 text-center">
                  <span className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">{profile.fullName}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{profile.role}</span>
                </div>
              </CardContent>
              {/* Added: Change Password Button */}
              <div className=" w-72  mx-auto">
                <Link href="/change-password">
                  <Button variant="outline" className="w-full">
                    Change Password
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Right-hand side: Personal Information Card */}
            <Card className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-md flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between md:px-8 md:py-2 md:px-16 pb-0" >
                <span className="text-lg font-bold">Personal Information</span>
                {editPersonal ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSave("personal")} className="gap-1">
                      Save <Save className="w-4 h-4 ml-1" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleCancel("personal")} className="gap-1">
                      Cancel <X className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => handleEdit("personal")}>
                    Edit <Pencil className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </CardHeader>
              {/* Corrected: Removed extra wrapper div and adjusted padding */}
              <CardContent className="flex flex-col gap-4 p-4 md:py-2 md:px-16 pt-0 flex-1">
                <div className="flex justify-between items-center py-2 border-b last:border-b-0 border-gray-100 dark:border-zinc-800">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Full Name</div>
                  {editPersonal ? (
                    <input
                      name="fullName"
                      value={tempProfile.fullName}
                      onChange={handleChange}
                      className="w-2/3 rounded-md px-3 py-2 text-right bg-gray-100 dark:bg-zinc-800 border-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                    />
                  ) : (
                    <div className="font-medium text-gray-800 dark:text-white">{profile.fullName}</div>
                  )}
                </div>
                <div className="flex justify-between items-center py-2 border-b last:border-b-0 border-gray-100 dark:border-zinc-800">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Department</div>
                  {editPersonal ? (
                    <input
                      name="department"
                      value={tempProfile.department}
                      onChange={handleChange}
                      className="w-2/3 rounded-md px-3 py-2 text-right bg-gray-100 dark:bg-zinc-800 border-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                    />
                  ) : (
                    <div className="font-medium text-gray-800 dark:text-white">{profile.department}</div>
                  )}
                </div>
                <div className="flex justify-between items-center py-2 border-b last:border-b-0 border-gray-100 dark:border-zinc-800">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Email Address</div>
                  <div className="font-medium text-gray-800 dark:text-white">{profile.email}</div>
                </div>
                <div className="flex justify-between items-center py-2 border-b last:border-b-0 border-gray-100 dark:border-zinc-800">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Phone Number</div>
                  {editPersonal ? (
                    <input
                      name="phone"
                      value={tempProfile.phone}
                      onChange={handleChange}
                      className="w-2/3 rounded-md px-3 py-2 text-right bg-gray-100 dark:bg-zinc-800 border-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                    />
                  ) : (
                    <div className="font-medium text-gray-800 dark:text-white">{profile.phone}</div>
                  )}
                </div>
                <div className="flex justify-between items-center py-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">User Role</div>
                  <div className="font-medium text-gray-800 dark:text-white">{profile.role}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </MainContainer>
      </div>
    </>
  );
}