"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { getErrorMessage } from "@/lib/getErrorMessage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const useCheckEmailLogic = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [isResending, setIsResending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { mutate: resendEmail } = trpc.auth.resendVerificationEmail.useMutation(
    {
      onSuccess: () => {
        setSuccessMessage("Verification email sent successfully!");
        setErrorMessage("");
        setIsResending(false);
      },
      onError: (error) => {
        setErrorMessage(getErrorMessage(error.message));
        setSuccessMessage("");
        setIsResending(false);
      }
    }
  );

  const handleResendEmail = () => {
    if (!email) return;

    setIsResending(true);
    setSuccessMessage("");
    setErrorMessage("");
    resendEmail({ email });
  };

  return {
    email,
    isResending,
    successMessage,
    errorMessage,
    handleResendEmail
  };
};

const CheckEmail = ({ className, ...props }: React.ComponentProps<"div">) => {
  const {
    email,
    isResending,
    successMessage,
    errorMessage,
    handleResendEmail
  } = useCheckEmailLogic();

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We've sent a verification link to verify your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <p>We've sent a verification link to:</p>
              {email && <p className="text-blue-600 font-medium">{email}</p>}
            </div>
            <div className="grid gap-3">
              <p>
                Click the link in the email to verify your account and complete
                your registration.
              </p>
              <p className="text-sm text-muted-foreground">
                Don't forget to check your spam folder if you don't see the
                email.
              </p>
            </div>
            <div className="grid gap-3">
              <p>Didn't receive the email?</p>
              <Button
                variant="outline"
                onClick={handleResendEmail}
                disabled={isResending || !email}
                className="w-full"
                type="button"
              >
                {isResending ? "Sending..." : "Resend verification email"}
              </Button>
              {successMessage && (
                <p className="text-green-600 text-sm">{successMessage}</p>
              )}
              {errorMessage && (
                <p className="text-red-600 text-sm">{errorMessage}</p>
              )}
            </div>
          </div>
          <div className="mt-4 text-center text-sm">
            <Link href="/auth/login" className="underline underline-offset-4">
              ← Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { CheckEmail };
