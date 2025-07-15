import { Suspense } from "react";
import SessionRefresher from "./page.client";

const Page = () => {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense>
          <SessionRefresher />
        </Suspense>
      </div>
    </div>
  );
};

export default Page;
