"use client";

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter for client-side redirection
import { getAuthData } from "@/services/api/Auth/auth";

// Define the shape of the props for our component
interface AuthProviderProps {
  children: ReactNode;
  allowedRoles: string[];
  isEnabled: boolean;
}

/**
 * A client-side component to handle role-based access control.
 * It checks the user's role against a list of allowed roles.
 * * @param children The components to render if the user has permission.
 * @param allowedRoles An array of roles that are allowed to view the content.
 * @param isEnabled A boolean flag to enable or disable the role check. If false, content is always shown.
 */
export function AuthProvider({ children, allowedRoles, isEnabled }: AuthProviderProps) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  const router = useRouter(); // Initialize the router

  // Use a single useEffect to check authentication status on mount
  useEffect(() => {
    const authData = getAuthData();
    if (authData && authData.user) {
      setUserRole(authData.user.role);
    } else {
      // If no auth data is found, redirect the user to the login page.
      // This protects the route from unauthenticated access.
      router.push('/login');
    }
    setIsAuthReady(true);
  }, [router]); // Include router in the dependency array

  // If the feature is disabled, render the children directly without any checks
  if (!isEnabled) {
    return <>{children}</>;
  }

  // Wait for the authentication data to be loaded from localStorage
  if (!isAuthReady) {
    return <div className='flex justify-center items-center h-screen text-2xl'><h1 >Loading...</h1></div>; // You can replace this with a more sophisticated spinner or loader
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
