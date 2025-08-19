import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SignpForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sign-up to new account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to create a new account
        </p>

      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Enter Your Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Enter New Password</Label>
        
          </div>
          <Input id="password" type="password" required />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Confirm Your Password</Label>
        
          </div>
          <Input id="password" type="password" required />
        </div>
        <Button type="submit" className="w-full">
          Sign up
        </Button>
     
      
      </div>
      <div className="text-center text-sm">
        Don you have an account?{" "}
        <a href="#" className="underline underline-offset-4">
          Log in
        </a>
      </div>
    </form>
  )
}
