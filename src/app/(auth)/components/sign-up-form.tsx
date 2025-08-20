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

export function SignpForm({
  className,
  ...props
}: React.ComponentProps<"form">) {

  const [password, setPassword] = useState('');

  // Calculate progress based on password length
  const progressValue = password.length >= 8 ? 100 : (password.length / 8) * 100;
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sign-up to Account</h1>
        <p className="text-muted-foreground text-sm text-balance">Welcome</p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="name"><SlUser className="h-4 w-4" />Enter Your Full Name</Label>
          <Input id="name" type="text" placeholder="H.M.C.K.Hearth" required />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="email"><SlEnvolope className="h-4 w-4" />Enter Your Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
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
            <Label htmlFor="password"><SlLock className="h-4 w-4" />Confirm Your Password</Label>

          </div>
          <PasswordInput />
        </div>
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
  )
}
