import { Suspense } from "react";
import { VerifyForm } from "./page.client";

const Page = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <h1>Verify Your Email</h1>
      <p>Enter the verification code you received by email.</p>
      <p>
        If you clicked the link in the email, the verification should happen
        automatically.
      </p>
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyForm />
      </Suspense>
    </div>
  );
};

export default Page;
