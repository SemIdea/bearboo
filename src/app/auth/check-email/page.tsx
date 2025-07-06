import { Suspense } from "react";
import { CheckEmailContent } from "./page.client";

const Page = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <h1>Check Your Email</h1>

      <Suspense fallback={<div>Loading...</div>}>
        <CheckEmailContent />
      </Suspense>
    </div>
  );
};

export default Page;
