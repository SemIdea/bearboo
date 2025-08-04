"use client";

import { trpc } from "@/app/_trpc/client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/error";
import { FormBase, InputField } from "@/components/formBase";
import { ErrorMessage } from "@/components/ui/errorMessage";
import {
  VerifyTokenInput,
  verifyTokenSchema
} from "@/server/schema/token.schema";

const useVerifyForm = () => {
  const router = useRouter();

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

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
      setErrorMessage(getErrorMessage(error.message));
      setIsVerifying(false);
    }
  });

  const handleVerifyToken = (data: VerifyTokenInput) => {
    console.log("Verifying token:", data);
    setIsVerifying(true);
    verifyToken(data);
  };

  return {
    isVerifying,
    successMessage,
    errorMessage,
    handleVerifyToken
  };
};

const VerifyForm = ({ token }: { token: string }) => {
  const { isVerifying, successMessage, errorMessage, handleVerifyToken } =
    useVerifyForm();

  return (
    <FormBase
      schema={verifyTokenSchema}
      onSubmit={handleVerifyToken}
      defaultValues={{ token }}
    >
      <InputField
        name="token"
        label="Verification Code"
        placeholder="Enter verification code"
      />
      <Button type="submit" disabled={isVerifying} className="w-full">
        {isVerifying ? "Verifying..." : "Verify"}
      </Button>
      <ErrorMessage error={errorMessage} />
      {successMessage && <div className="text-green-600">{successMessage}</div>}
    </FormBase>
  );
};

export { VerifyForm };
