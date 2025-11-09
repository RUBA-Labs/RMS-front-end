"use client"; // Required for hooks

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getAuthData, removeAuthData } from "@/services/api/Auth/auth";
import { SESSION_API_URL_IS_VALID } from "@/services/api/apiConfig";
import { getDashboardPathByRole } from "@/services/api/Auth/roleRedirect";

import { SignpForm } from "../../components/sign-up-form"; // Corrected spelling to SignupForm if needed
import { ModeToggle } from "@/components/ModeToggle";
import ImageArea from "../../components/imageArea";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const authData = getAuthData();
      const dashboardPath = getDashboardPathByRole(authData?.user.role || "");

      // 1. If no token, user is not logged in. Show the sign-up page.
      if (!authData || !authData.accessToken) {
        setIsLoading(false);
        return;
      }

      // 2. If token exists, validate it
      try {
        const response = await axios.get(SESSION_API_URL_IS_VALID, {
          headers: {
            Authorization: `Bearer ${authData.accessToken}`,
          },
        });

        // 3. If token is valid, redirect to their dashboard
        if (response.data?.isValid) {
          router.push(dashboardPath);
        } else {
          // 4. If token is invalid, clear it and show sign-up page
          removeAuthData();
          setIsLoading(false);
        }
      } catch (error) {
        // 5. If API fails, token is bad. Clear it and show sign-up page.
        removeAuthData();
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [router]);

  // Show a loading screen while checking the token
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-2xl">
        <h1>Loading...</h1>
      </div>
    );
  }

  // Once loading is false, show the sign-up page
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <ImageArea />
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <div className="absolute top-4 right-4">
              <ModeToggle />
            </div>
            <SignpForm />
          </div>
        </div>
      </div>
    </div>
  );
}