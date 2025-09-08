"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, XIcon } from "lucide-react";
import { InputOTPDemo } from "./inputOTP";
import { verifyOtp } from "@/services/api/EmailValidation/verifyOTP";
import { reqSendTheOtp } from "@/services/api/EmailValidation/reqSendTheOtp";
import { createUser } from "@/services/api/User/CreateUser"; // Import the createUser function
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { SlEnvolope } from "react-icons/sl";

export function EmailVerificationForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    variant: "destructive" | "default";
  }>({
    visible: false,
    title: "",
    message: "",
    variant: "destructive",
  });
  const router = useRouter();

  useEffect(() => {
    // Retrieve the user's email from local storage
    const storedData = localStorage.getItem("signupData");
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        if (data.email) {
          setUserEmail(data.email);
        }
      } catch (e) {
        console.error("Failed to parse signupData from local storage", e);
      }
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setAlert({ visible: false, title: "", message: "", variant: "destructive" });

    if (otp.length < 6) {
      setAlert({
        visible: true,
        title: "Invalid OTP",
        message: "Please enter the full 6-digit OTP.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      // Step 1: Verify the OTP with the backend
      const verificationResponse = await verifyOtp(otp);
      console.log("OTP verification successful:", verificationResponse);

      // Step 2: If OTP verification succeeds, create the user
      const creationResponse = await createUser();
      console.log("User creation successful:", creationResponse);

      setAlert({
        visible: true,
        title: "Verification Successful!",
        message: "You will now be redirected.",
        variant: "default",
      });

      // Redirect to a success page or login page
      router.push("/login");
    } catch (error) {
      console.error("User verification or creation failed:", error);
      setAlert({
        visible: true,
        title: "Verification Failed",
        message: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setAlert({ visible: false, title: "", message: "", variant: "destructive" });
    try {
      await reqSendTheOtp(userEmail);
      setOtp(""); // Clears the OTP input field
      setAlert({
        visible: true,
        title: "OTP Resent!",
        message: "A new verification code has been sent to your email.",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to resend OTP:", error);
      setAlert({
        visible: true,
        title: "Resend Failed",
        message: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Enter Verification Code</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Check your email inbox for the verification code
        </p>
      </div>
      
      <div className="grid gap-3">
        <Label htmlFor="email"><SlEnvolope className="h-4 w-4" />Your Email</Label>
        <Input
          id="email"
          type="email"
          value={userEmail}
          readOnly
          className="text-gray-500 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
        />
        <div className="text-center text-sm">
          Wrong email?{" "}
          <Link href="/sign-up" className="underline underline-offset-4">
            Change email
          </Link>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <InputOTPDemo value={otp} onValueChange={setOtp} />
        {alert.visible && (
          <Alert variant={alert.variant} className="relative pr-8">
            {alert.variant === "destructive" ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>
              {alert.message}
              {alert.variant === "destructive" && (
                <Button 
                  type="button" 
                  variant="link" 
                  className="p-0 h-auto"
                  onClick={handleResendOtp}
                  disabled={loading}
                >
                  <span className="underline ml-1">Resend OTP</span>
                </Button>
              )}
            </AlertDescription>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => setAlert({ visible: false, title: "", message: "", variant: "destructive" })}
            >
              <XIcon className="h-4 w-4 text-gray-500" />
            </Button>
          </Alert>
        )}
        <Button type="submit" className="w-full" disabled={loading || otp.length < 6}>
          {loading ? "Verifying..." : "Confirm"}
        </Button>
      </div>
    </form>
  );
}
