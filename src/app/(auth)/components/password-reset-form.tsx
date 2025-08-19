import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function PasswordResetForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Reset Your Password</h1>
      <p className="text-muted-foreground text-sm text-balance">
          Enter your current and new password below to reset your account password
        </p>
      </div>
      
      <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Current Password</Label>
        
          </div>
          <Input id="password" type="password" required />
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
          Confirm
        </Button>
     
      
    </form>
  )
}
