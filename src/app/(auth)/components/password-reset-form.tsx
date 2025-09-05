"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SlEnvolope, SlLock } from "react-icons/sl"
import { PasswordInput } from "./password-input"
import Link from "next/link"
import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import { InputOTPDemo } from "./inputOTP"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, XIcon } from "lucide-react"
import { requestPasswordReset } from "@/services/api/PasswordReset/requestPasswordReset"
import { verifyPasswordResetOtp } from "@/services/api/PasswordReset/verifyPasswordResetOtp"
import { useRouter } from "next/navigation";


export function PasswordResetForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const router = useRouter();
  
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
    // Calculate progress based on password length
  const progressValue = password.length >= 8 ? 100 : (password.length / 8) * 100;
  
  const handleResetRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setAlert({ visible: false, title: "", message: "", variant: "destructive" });

    if (password !== confirmPassword) {
      setAlert({
        visible: true,
        title: "Password Mismatch",
        message: "The new passwords do not match. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      await requestPasswordReset(email, password);
      setShowOtpInput(true);
      setAlert({
        visible: true,
        title: "OTP Sent!",
        message: "Please check your email for the verification code.",
        variant: "default",
      });
    } catch (error) {
      console.error("Password reset request failed:", error);
      setAlert({
        visible: true,
        title: "Request Failed",
        message: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async () => {
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
      await verifyPasswordResetOtp(otp);
      setAlert({
        visible: true,
        title: "Password Reset Successful!",
        message: "Your password has been changed. Redirecting to login...",
        variant: "default",
      });
      router.push("/login");
    } catch (error) {
      console.error("OTP verification failed:", error);
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

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleResetRequest}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Reset Your Password</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Welcome
        </p>
      </div>

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
          <Label htmlFor="password"><SlLock className="h-4 w-4" />Enter New Password</Label>
        </div>
        <div className="flex flex-col gap-4">
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Progress value={progressValue} />
        </div>
      </div>

      <div className="grid gap-3">
        <div className="flex items-center">
          <Label htmlFor="confirm-password"><SlLock className="h-4 w-4" />Confirm Your Password</Label>
        </div>
        <PasswordInput 
          id="confirm-password" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
        />
      </div>

      {!showOtpInput && (
        <Button type="submit" className="w-full" disabled={loading || password !== confirmPassword || password.length < 8}>
          {loading ? "Requesting..." : "Confirm"}
        </Button>
      )}

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
      
      {showOtpInput && (
        <div className="grid gap-3 justify-center">
          <InputOTPDemo value={otp} onValueChange={setOtp} />
          <Button onClick={handleOtpVerification} disabled={loading || otp.length < 6}>Verify OTP</Button>
        </div>
      )}

      <div className="text-center text-sm">
        Do you remember password?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Login
        </Link>
      </div>
    </form>
  )
}
