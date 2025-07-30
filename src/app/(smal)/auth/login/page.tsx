import { LoginForm } from "./page.client";
import { CardComponent } from "@/components/card";
import Link from "next/link";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <CardComponent
        title="Login to your account"
        description="Enter your email below to login to your account"
        content={
          <>
            <LoginForm />
            <div className="mt-4 text-center text-sm">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="underline underline-offset-4"
              >
                Sign up
              </Link>
            </div>
          </>
        }
      />
    </div>
  );
};

export default Page;
