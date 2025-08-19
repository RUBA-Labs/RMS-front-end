import { GalleryVerticalEnd } from "lucide-react"

import { EmailVerificationForm } from "../../components/email-verification-form"
import { ModeToggle } from "@/components/ModeToggle"

export default function EmailVerificationPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
        <div className=" relative hidden lg:block">
        <img
          src="/1234-01.png"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.8] "
        />
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <div className="absolute top-4 right-4">
                <ModeToggle />
              </div>
            <EmailVerificationForm />
          </div>
        </div>
      </div>
      
    </div>
  )
}
