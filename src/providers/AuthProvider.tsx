"use client";

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthData, removeAuthData } from "@/services/api/Auth/auth";
import { SESSION_API_URL_IS_VALID } from '@/services/api/apiConfig';
import axios from 'axios';

// Define the shape of the props for our component
interface AuthProviderProps {
  children: ReactNode;
  allowedRoles: string[];
  isEnabled: boolean;
}

/**
 * A client-side component to handle role-based access control.
 * It checks the user's role and validates the JWT token with the backend.
 * @param children The components to render if the user has permission.
 * @param allowedRoles An array of roles that are allowed to view the content.
 * @param isEnabled A boolean flag to enable or disable the role check. If false, content is always shown.
 */
export function AuthProvider({ children, allowedRoles, isEnabled }: AuthProviderProps) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const validateToken = async () => {
      const authData = getAuthData();

      if (!authData || !authData.accessToken) {
        removeAuthData(); // Ensure any bad data is cleared
        router.push('/login');
        return;
      }

      try {
        const response = await axios.get(
          SESSION_API_URL_IS_VALID, 
          {
            headers: {
              Authorization: `Bearer ${authData.accessToken}`,
            },
          }
        );

        // console.log('Session validation response:', response.data);

        if (response.data?.isValid) {
          setUserRole(authData.user.role);
        } else {
          // If the backend says the token is not valid, clear and redirect
          removeAuthData();
          router.push('/login');
        }

      } catch (error) {
        // If the API call fails (e.g., 401 Unauthorized), clear and redirect
        console.error('Session validation failed:', error);
        removeAuthData();
        router.push('/login');
      } finally {
        setIsAuthReady(true);
      }
    };

    if (isEnabled) {
      validateToken();
    } else {
      setIsAuthReady(true);
    }
  }, [router, isEnabled]);

  // If the feature is disabled, render the children directly
  if (!isEnabled) {
    return <>{children}</>;
  }

  // Wait for the authentication data to be loaded and validated
  if (!isAuthReady) {
    return <div className='flex justify-center items-center h-screen text-2xl'><h1 >Loading...</h1></div>;
  }

  // If the user's role is not found, or it's not in the list of allowed roles,
  // display a permission denied message.
  if (!userRole || !allowedRoles.includes(userRole)) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-red-500 bg-red-50 rounded-lg shadow-md">
        <h2 className="text-xl font-bold">Permission Denied</h2>
        <p className="mt-2 text-sm text-red-700">
          You do not have the required permissions to view this content.
        </p>
      </div>
    );
  }

  // If the user's role is in the allowed list, render the children
  return <>{children}</>;
}
