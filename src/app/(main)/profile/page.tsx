"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MainContainer } from "./components/profile-main-container";
import { Button } from "@/components/ui/button";
import { Pencil, Save, X } from "lucide-react";
import { ProfileHeader } from "./components/ProfileHeader";

// Animated/illustrated avatars for each role
const profileImages: Record<string, string> = {
  Admin: "https://cdn.jsdelivr.net/gh/realstoman/animated-svg-avatars@main/dist/svg/avatar-1.svg",
  Student: "https://cdn.jsdelivr.net/gh/realstoman/animated-svg-avatars@main/dist/svg/avatar-2.svg",
  Academic: "https://cdn.jsdelivr.net/gh/realstoman/animated-svg-avatars@main/dist/svg/avatar-3.svg",
  "Non-academic": "https://cdn.jsdelivr.net/gh/realstoman/animated-svg-avatars@main/dist/svg/avatar-4.svg",
};

export default function Profile() {
  // Example: Use a role to select an animated SVG avatar
  const role = "Admin";
  const profileImage = profileImages[role] || profileImages["Admin"];

  // Editable state
  const [editPersonal, setEditPersonal] = useState(false);
  const [editAddress, setEditAddress] = useState(false);

  // Profile data state
  const [profile, setProfile] = useState({
    firstName: "Natashia",
    lastName: "Khaleira",
    department: "Sinhala",
    email: "info@binary-fusion.com",
    phone: "(+62) 821 2554-5846",
    role: role,
    country: "United Kingdom",
    city: "Leeds, East London",
    postal: "ERT 1254",
  });

  // Temp state for editing
  const [tempProfile, setTempProfile] = useState(profile);

  // Handlers
  const handleEdit = (section: "personal" | "address") => {
    setTempProfile(profile);
    if (section === "personal") setEditPersonal(true);
    if (section === "address") setEditAddress(true);
  };

  const handleCancel = (section: "personal" | "address") => {
    setTempProfile(profile);
    if (section === "personal") setEditPersonal(false);
    if (section === "address") setEditAddress(false);
  };

  const handleSave = (section: "personal" | "address") => {
    setProfile(tempProfile);
    if (section === "personal") setEditPersonal(false);
    if (section === "address") setEditAddress(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempProfile({ ...tempProfile, [e.target.name]: e.target.value });
  };

  return (
    <>
      <div className="p-4 md:p-8">
        <ProfileHeader />
        <MainContainer>
          <div className="flex items-center pl-4 pt-0.5 pb-2">
            <h3 className="text-3xl font-semibold tracking-tight first:mt-0 mr-4">
              My Profile
            </h3>
            <div className="flex-1 h-px dark:bg-gray-200/20 bg-gray-700/40" />
          </div>

          {/* Profile Card */}
          <Card className="mb-6 mt-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm">
            <CardContent className="flex items-center gap-6 p-6">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="object-cover w-full h-full"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute bottom-1 right-1 p-1 bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-800"
                >
                  <Pencil className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </Button>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-lg font-semibold">{profile.firstName} {profile.lastName}</span>
                <span className="text-sm text-muted-foreground">{profile.role}</span>
                <span className="text-sm text-muted-foreground">
                  {profile.city}, {profile.country}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="mb-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-base font-semibold">Personal Information</span>
              {editPersonal ? (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleSave("personal")} className="gap-1">
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
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 pt-0">
              <div>
                <div className="text-xs text-muted-foreground mb-1">First Name</div>
                {editPersonal ? (
                  <input
                    name="firstName"
                    value={tempProfile.firstName}
                    onChange={handleChange}
                    className="input input-bordered w-full rounded px-2 py-1 bg-transparent border"
                  />
                ) : (
                  <div className="font-medium">{profile.firstName}</div>
                )}
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Last Name</div>
                {editPersonal ? (
                  <input
                    name="lastName"
                    value={tempProfile.lastName}
                    onChange={handleChange}
                    className="input input-bordered w-full rounded px-2 py-1 bg-transparent border"
                  />
                ) : (
                  <div className="font-medium">{profile.lastName}</div>
                )}
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Department</div>
                {editPersonal ? (
                  <input
                    name="department"
                    value={tempProfile.department}
                    onChange={handleChange}
                    className="input input-bordered w-full rounded px-2 py-1 bg-transparent border"
                  />
                ) : (
                  <div className="font-medium">{profile.department}</div>
                )}
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Email Address</div>
                
                  <div className="font-medium">{profile.email}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Phone Number</div>
                {editPersonal ? (
                  <input
                    name="phone"
                    value={tempProfile.phone}
                    onChange={handleChange}
                    className="input input-bordered w-full rounded px-2 py-1 bg-transparent border"
                  />
                ) : (
                  <div className="font-medium">{profile.phone}</div>
                )}
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">User Role</div>
                <div className="font-medium">{profile.role}</div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-base font-semibold">Address</span>
              {editAddress ? (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleSave("address")} className="gap-1">
                    Save <Save className="w-4 h-4 ml-1" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleCancel("address")} className="gap-1">
                    Cancel <X className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" className="gap-1" onClick={() => handleEdit("address")}>
                  Edit <Pencil className="w-4 h-4 ml-1" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 pt-0">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Country</div>
                {editAddress ? (
                  <input
                    name="country"
                    value={tempProfile.country}
                    onChange={handleChange}
                    className="input input-bordered w-full rounded px-2 py-1 bg-transparent border"
                  />
                ) : (
                  <div className="font-medium">{profile.country}</div>
                )}
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">City</div>
                {editAddress ? (
                  <input
                    name="city"
                    value={tempProfile.city}
                    onChange={handleChange}
                    className="input input-bordered w-full rounded px-2 py-1 bg-transparent border"
                  />
                ) : (
                  <div className="font-medium">{profile.city}</div>
                )}
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Postal Code</div>
                {editAddress ? (
                  <input
                    name="postal"
                    value={tempProfile.postal}
                    onChange={handleChange}
                    className="input input-bordered w-full rounded px-2 py-1 bg-transparent border"
                  />
                ) : (
                  <div className="font-medium">{profile.postal}</div>
                )}
              </div>
            </CardContent>
          </Card>
        </MainContainer>
      </div>
    </>
  );
}