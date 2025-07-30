import { Suspense } from "react";
import { VerifyForm } from "./page.client";
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
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            Please enter the verification code sent to your email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense>
            <VerifyForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
