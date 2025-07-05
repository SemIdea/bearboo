"use client";

import { trpc } from "@/app/_trpc/client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const VerifyForm = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
      setIsVerifying(true);
      verifyToken({ token: urlToken });
    }
  }, [searchParams]);

  const { mutate: verifyToken } = trpc.auth.verify.useMutation({
    onSuccess: () => {
      setSuccessMessage("Verification successful! You can now log in.");
      setIsVerifying(false);

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    },
    onError: (error) => {
      setErrorMessage(`Verification failed: ${error.message}`);
      setIsVerifying(false);
    }
  });

  const handleVerifyToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (token) {
      setIsVerifying(true);
      verifyToken({ token });
    } else {
      setErrorMessage("Please enter a verification code");
    }
  };

  return (
    <>
      {!successMessage && !errorMessage && (
        <form onSubmit={handleVerifyToken}>
          <input
            type="text"
            placeholder="Enter verification code"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={isVerifying}
          />
          <button type="submit" disabled={isVerifying || !token}>
            {isVerifying ? "Verifying..." : "Verify Email"}
          </button>
        </form>
      )}

      {successMessage && (
        <div>
          <p className="text-green-600">{successMessage}</p>
          <p>Redirecting to login page...</p>
          <Link href="/auth/login" className="text-blue-600 underline">
            Go to Login
          </Link>
        </div>
      )}

      {errorMessage && (
        <div>
          <p className="text-red-600">{errorMessage}</p>
          <div>
            <p>The verification link may have expired or been used already.</p>
            <Link href="/auth/register" className="text-blue-600 underline">
              Register again
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export { VerifyForm };
