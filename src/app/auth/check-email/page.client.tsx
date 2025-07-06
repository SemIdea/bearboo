"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import Link from "next/link";

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

const CheckEmailContent = () => {
  const { email, isResending, resendMessage, handleResendEmail } =
    useCheckEmailLogic();

  return (
    <>
      <div>
        <p>We've sent a verification link to:</p>
        {email && <p className="text-blue-600">{email}</p>}
      </div>
      <div>
        <p>
          Click the link in the email to verify your account and complete your
          registration.
        </p>
        <p>
          Don't forget to check your spam folder if you don't see the email.
        </p>
      </div>
      <div>
        <p>Didn't receive the email?</p>
        <button onClick={handleResendEmail} disabled={isResending || !email}>
          {isResending ? "Sending..." : "Resend verification email"}
        </button>

        {resendMessage && (
          <p
            className={
              resendMessage.includes("Error")
                ? "text-red-600"
                : "text-green-600"
            }
          >
            {resendMessage}
          </p>
        )}
      </div>
      <div>
        <Link href="/auth/login" className="text-blue-600 underline">
          ← Back to Login
        </Link>
      </div>
    </>
  );
};

export { CheckEmailContent };
