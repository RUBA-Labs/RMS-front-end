"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, XIcon } from "lucide-react";
import { InputOTPDemo } from "./inputOTP";
import { verifyOtp } from "@/services/api/EmailValidation/verifyOTP";

export function EmailVerificationForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
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
      const response = await verifyOtp(otp);
      console.log("OTP verification successful:", response);

      setAlert({
        visible: true,
        title: "Verification Successful!",
        message: "You will now be redirected.",
        variant: "default",
      });

      // Redirect to a success page or login page
      router.push("/success-page");
    } catch (error) {
      console.error("OTP verification failed:", error);
      setAlert({
        visible: true,
        title: "Verification Failed",
        message: typeof error === "object" && error !== null && "message" in error && typeof (error as any).message === "string"
          ? (error as any).message
          : "An unknown error occurred.",
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
            <AlertDescription>{alert.message}</AlertDescription>
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
