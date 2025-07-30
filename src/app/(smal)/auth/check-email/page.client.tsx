"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/error";
import { ErrorMessage } from "@/components/ui/errorMessage";

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

const ResendEmailButton = () => {
  const {
    email,
    isResending,
    handleResendEmail,
    successMessage,
    errorMessage
  } = useCheckEmailLogic();

  return (
    <>
      <Button
        variant="outline"
        onClick={handleResendEmail}
        disabled={isResending || !email}
        className="w-full"
        type="button"
      >
        {isResending ? "Sending..." : "Resend verification email"}
      </Button>
      <ErrorMessage error={errorMessage} />
      {successMessage && (
        <p className="text-green-600 text-sm">{successMessage}</p>
      )}
    </>
  );
};

export { ResendEmailButton };
