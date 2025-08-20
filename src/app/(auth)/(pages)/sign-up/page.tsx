import { GalleryVerticalEnd } from "lucide-react"

import { SignpForm } from "../../components/sign-up-form"
import { ModeToggle } from "@/components/ModeToggle"
import ImageArea from "../../components/imageArea"

export default function SignupPage() {
  return (
     <div className="grid min-h-svh lg:grid-cols-2">
            <ImageArea />
          <div className="flex flex-col gap-4 p-6 md:p-10">
            
            <div className="flex flex-1 items-center justify-center">
              <div className="w-full max-w-xs">
                <div className="absolute top-4 right-4">
                    <ModeToggle />
                  </div>
                <SignpForm/>
              </div>
            </div>
          </div>
          
        </div>

  )
}
