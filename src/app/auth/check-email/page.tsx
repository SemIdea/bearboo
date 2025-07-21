import { Suspense } from "react";
import { CheckEmail } from "./page.client";

const Page = () => {
  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-sm">
        <Suspense fallback={<div>Loading...</div>}>
          <CheckEmail />
        </Suspense>
      </div>
    </div>
  );
};

export default Page;
