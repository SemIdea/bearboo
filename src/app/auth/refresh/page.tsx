import { Suspense } from "react";
import SessionRefresher from "./page.client";

const Page = () => {
  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-sm">
        <Suspense>
          <SessionRefresher />
        </Suspense>
      </div>
    </div>
  );
};

export default Page;
