"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SlLock, SlEnvolope, SlUser } from "react-icons/sl";
import { PasswordInput } from "./password-input";
import Link from "next/link";
import { Progress } from "@/components/ui/progress"
import { useState } from "react";
import type { FormEvent } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, XIcon } from "lucide-react";
import { useRouter } from 'next/navigation';

import { saveUserData } from "@/services/api/SignUp/signUp";
import { reqSendTheOtp } from "@/services/api/EmailValidation/reqSendTheOtp"

export function SignpForm({
  className,
  ...props
}: React.ComponentProps<"form">) {

  const [fullName, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: ''
  });
  
  const router = useRouter();


  // Calculate progress based on password length
  const progressValue = password.length >= 8 ? 100 : (password.length / 8) * 100;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Reset any previous alerts
    setAlert({ visible: false, title: '', message: '' });

    if (password.length < 8) {
      setAlert({
        visible: true,
        title: "Weak Password",
        message: "Password must be at least 8 characters long."
      });
      return;
    }

    if (password !== confirmPassword) {
      setAlert({
        visible: true,
        title: "Password Mismatch",
        message: "The passwords you entered do not match."
      });
      return;
    }

    saveUserData({ fullName, email, password });
    reqSendTheOtp(email);
      

    // Redirect to the email verification page using the Next.js router
    router.push("/email-verification");
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sign-up to Account</h1>
        <p className="text-muted-foreground text-sm text-balance">Welcome</p>
      </div>

      
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="name"><SlUser className="h-4 w-4" />Enter Your Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="H.M.C.K.Hearth"
            required
            value={fullName}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="email"><SlEnvolope className="h-4 w-4" />Enter Your Email</Label>
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
            <Label htmlFor="password"><SlLock className="h-4 w-4" />Enter Password</Label>
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
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        {alert.visible && (
        <Alert variant="destructive" className="">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={() => setAlert({ visible: false, title: '', message: '' })}
          >
            <XIcon className="h-4 w-4 text-gray-500" />
          </Button>
        </Alert>
      )}

        <Button type="submit" className="w-full">
          Sign up
        </Button>
      </div>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Login
        </Link>
      </div>
    </form>
  );
}
