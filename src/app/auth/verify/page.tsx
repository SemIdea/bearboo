import { Suspense } from "react";
import { VerifyForm } from "./page.client";

const Page = () => {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<div>Loading...</div>}>
          <VerifyForm />
        </Suspense>
      </div>
    </div>
  );
};

export default Page;
