import { Suspense } from "react";
import SessionRefresher from "./page.client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>Session Refresh</CardTitle>
          <CardDescription>
            We are refreshing your session. Please wait...
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p>Refreshing your session...</p>
          <Suspense>
            <SessionRefresher />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
