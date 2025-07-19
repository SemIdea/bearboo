import { Suspense } from "react";
import SessionRefresher from "./page.client";

const Page = () => {
  return (
    <Suspense>
      <SessionRefresher />
    </Suspense>
  );
};

export default Page;
