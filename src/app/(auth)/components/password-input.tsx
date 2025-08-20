"use client"

import * as React from "react"
import { useState } from "react"
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
    
  }

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          required
          className={cn("pr-10", className)} // The pr-10 class is crucial for icon spacing
          {...props}
          ref={ref}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="text-muted-foreground hover:text-foreground rounded-md"
          >
            {showPassword ? (
              <FaEyeSlash className="h-4 w-4" />
            ) : (
              <FaEye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }