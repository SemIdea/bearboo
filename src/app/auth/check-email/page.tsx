"use client";

import Link from "next/link";
import { useCheckEmailLogic } from "./page.client";

const CheckEmailPage = () => {
  const { email, isResending, resendMessage, handleResendEmail } =
    useCheckEmailLogic();

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <h1>Check Your Email</h1>

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
    </div>
  );
};

export default CheckEmailPage;
