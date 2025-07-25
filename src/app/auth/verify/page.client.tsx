"use client";

import { trpc } from "@/app/_trpc/client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { extractErrorMessage } from "@/lib/error";

const useVerifyForm = () => {
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

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    },
    onError: (error) => {
      setErrorMessage(extractErrorMessage(error));
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

  return {
    token,
    setToken,
    successMessage,
    errorMessage,
    isVerifying,
    handleVerifyToken
  };
};

const VerifyForm = ({ className, ...props }: React.ComponentProps<"div">) => {
  const {
    token,
    setToken,
    successMessage,
    errorMessage,
    isVerifying,
    handleVerifyToken
  } = useVerifyForm();

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            Please enter the verification code sent to your email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyToken}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="token">Verification Code</Label>
                <Input
                  id="token"
                  type="text"
                  placeholder="Enter verification code"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
                <Button type="submit" disabled={isVerifying} className="w-full">
                  {isVerifying ? "Verifying..." : "Verify"}
                </Button>
                {successMessage && (
                  <div className="text-green-600">{successMessage}</div>
                )}
                {errorMessage && (
                  <div className="text-red-600">{errorMessage}</div>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export { VerifyForm };
