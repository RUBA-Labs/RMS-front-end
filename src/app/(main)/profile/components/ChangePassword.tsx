"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/app/(auth)/components/password-input";
import { changePassword } from "@/services/api/UserProfile/changePassword";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, XIcon } from "lucide-react";
import { SlLock } from "react-icons/sl";

export function ChangePassword({
  className,
  onSuccess,
  ...props
}: React.ComponentProps<"form"> & { onSuccess?: (message: string) => void }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    variant: "destructive" | "default";
  }>({
    visible: false,
    title: "",
    message: "",
    variant: "destructive",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setAlert({ visible: false, title: "", message: "", variant: "destructive" });

    if (newPassword !== confirmPassword) {
      setAlert({
        visible: true,
        title: "Password Mismatch",
        message: "The new passwords do not match. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
        setAlert({
            visible: true,
            title: "Weak Password",
            message: "Password must be at least 8 characters long.",
            variant: "destructive"
        });
        setLoading(false);
        return;
    }

    try {
      const message = await changePassword(oldPassword, newPassword);
      if (onSuccess) {
        onSuccess(message);
      } else {
        setAlert({
          visible: true,
          title: "Success!",
          message: message,
          variant: "default",
        });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Failed to change password:", error);
      setAlert({
        visible: true,
        title: "Error",
        message: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6 pt-4", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="old-password">
            <SlLock className="h-4 w-4" />
            Old Password
          </Label>
          <PasswordInput
            id="old-password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="new-password">
            <SlLock className="h-4 w-4" />
            New Password
          </Label>
          <PasswordInput
            id="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="confirm-password">
            <SlLock className="h-4 w-4" />
            Confirm New Password
          </Label>
          <PasswordInput
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        {alert.visible && (
          <Alert variant={alert.variant} className="relative pr-8">
            {alert.variant === "destructive" ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => setAlert({ ...alert, visible: false })}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Changing Password..." : "Change Password"}
        </Button>
      </div>
    </form>
  );
}
