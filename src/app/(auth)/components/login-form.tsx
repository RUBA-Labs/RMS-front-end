import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "./password-input"
import { SlEnvolope, SlLock } from "react-icons/sl";
import Link from "next/link"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your Account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Welcome
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email"><SlEnvolope className="h-4 w-4" />Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
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
          <PasswordInput />
        </div>
        <Button type="submit" className="w-full">
          Login
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
