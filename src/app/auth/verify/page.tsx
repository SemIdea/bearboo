import { Suspense } from "react";
import { VerifyForm } from "./page.client";

const Page = () => {
  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-sm">
        <Suspense fallback={<div>Loading...</div>}>
          <VerifyForm />
        </Suspense>
      </div>
    </div>
  );
};

export default Page;
