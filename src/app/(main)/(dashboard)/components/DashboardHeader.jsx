import Image from "next/image"
import universityLogo from "../../../../assets/university-of-peradeniya-seeklogo.png"
import { DropdownNotification } from "../components/DropdownNotification"

export function DashboardHeader() {
    return (
        <header className="bg-white/10 backdrop-blur-sm px-4 md:px-6 lg:px-8 py-2 flex h-[var(--header-height)] shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[var(--header-height)] rounded-2xl shadow-lg hover:shadow-2xl hover:border-gray-200">
            <div className="flex w-full items-center justify-between py-1 gap-2 md:gap-4 lg:gap-6">
                
                {/* Mobile: Logo and Title on the left */}
                <div className="flex items-center gap-4 ">
                    <div className="w-8 h-8 md:w-10 md:h-10">
                        <Image
                            src={universityLogo}
                            alt="University of Peradeniya Logo"
                            width={40}
                            height={40}
                            className="w-full h-full object-contain"
                            unoptimized
                             
                        />
                    </div>
                    <h1 className="text-base sm:text-lg font-semibold tracking-tight whitespace-nowrap">
                        Faculty of Arts
                    </h1>
                </div>

             

                {/* Right-aligned Buttons */}
                <div className="ml-auto flex items-center gap-2 md:gap-4">
                    <DropdownNotification />
              
                </div>
            </div>
        </header>
    );
}