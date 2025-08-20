import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { InputOTPDemo } from "./inputOTP"

export function EmailVerificationForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Enter Verification Code</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Check your email inbox for the verification code
        </p>

      </div>

        
       <div className="flex flex-col items-center space-y-4">
  <InputOTPDemo />
  <Button type="submit" className="w-full">
    Confirm
  </Button>
</div>
        
     
      
    </form>
  )
}
