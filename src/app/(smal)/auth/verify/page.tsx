import { Suspense } from "react";
import { CardBase } from "@/components/cardBase";
import { EmailParam } from "./page.server";
import { ResendEmailButton } from "./page.client";

export const experimental_ppr = true;

const Page = () => {
  return (
    <div>
      <CardBase
        title="Check your email"
        description="We've sent a verification link to your email address."
        content={
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <p>We've sent a verification link to:</p>
              <p className="text-blue-600 font-medium">
                <Suspense>
                  <EmailParam />
                </Suspense>
              </p>
            </div>
            <div className="grid gap-3">
              <p>
                Click the link in the email to verify your account and complete
                your registration.
              </p>
              <p className="text-sm text-muted-foreground">
                Don't forget to check your spam folder if you don't see the
                email.
              </p>
            </div>
            <div className="grid gap-3">
              <p>Didn't receive the email?</p>
              <Suspense>
                <ResendEmailButton />
              </Suspense>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default Page;
