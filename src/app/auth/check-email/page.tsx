import { Suspense } from "react";
import { CheckEmail } from "@/components/check-email";

const Page = () => {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<div>Loading...</div>}>
          <CheckEmail />
        </Suspense>
      </div>
    </div>
  );
};

export default Page;
