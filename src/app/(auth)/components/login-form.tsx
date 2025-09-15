"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "./password-input"
import { SlEnvolope, SlLock } from "react-icons/sl";
import Link from "next/link"
import { useState } from 'react';
import { loginPost } from "@/services/api/Auth/loginPost"; // Import the loginPost function
import { saveAuthData } from "@/services/api/Auth/auth"; // Import the saveAuthData function
import { useRouter } from 'next/navigation';
import { getDashboardPathByRole } from '@/services/api/Auth/roleRedirect'; // Import the new utility function
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, XIcon } from "lucide-react";


export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent the default form submission
    setLoading(true);
    setError(null);
    setSuccess(null);

    

    try {
      const response = await loginPost(email, password);
      
      // Save the authentication data to localStorage using the utility function
      // Note: We map the 'access_token' from the response to 'accessToken' for our local storage schema
      saveAuthData({
        accessToken: response.access_token,
        user: response.user
      });
      
      // Get the role from the response
      const userRole = response.user.role;
      
      // Use the new utility function to get the correct path
      const redirectPath = getDashboardPathByRole(userRole);
      
      setSuccess("Login successful! Redirecting...");
      
      // Redirect the user to the determined path
      router.push(redirectPath);

    } catch (err: unknown) {
      console.error('Login failed:', err);
      // Check if the error is an instance of Error to safely access its message
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your Account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Welcome
        </p>
      </div>
      <div className="grid gap-6">
        
        <div className="grid gap-3">
          <Label htmlFor="email"><SlEnvolope className="h-4 w-4" />Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="m@example.com" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password"><SlLock className="h-4 w-4" />Password</Label>
            <Link
              href="/password-reset"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forget your password?
            </Link>
          </div>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <Alert variant="destructive" className="relative pr-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Login Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => setError(null)}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </Alert>
        )}
        {success && (
          <Alert className="relative pr-8">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => setSuccess(null)}
            >
              <XIcon className="h-4 w-4 text-gray-500" />
            </Button>
          </Alert>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="underline underline-offset-4">
          Sign up
        </Link>
      </div>
    </form>
  )
}
