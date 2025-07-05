"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/app/_trpc/client";

const useCheckEmailLogic = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const { mutate: resendEmail } = trpc.auth.resendVerificationEmail.useMutation(
    {
      onSuccess: () => {
        setResendMessage("Verification email sent successfully!");
        setIsResending(false);
      },
      onError: (error) => {
        setResendMessage(`Error: ${error.message}`);
        setIsResending(false);
      }
    }
  );

  const handleResendEmail = () => {
    if (!email) return;

    setIsResending(true);
    setResendMessage("");
    resendEmail({ email });
  };

  return {
    email,
    isResending,
    resendMessage,
    handleResendEmail
  };
};

export { useCheckEmailLogic };
