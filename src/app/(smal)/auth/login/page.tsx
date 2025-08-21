import { LoginForm } from "./page.client";
import { CardBase } from "@/components/cardBase";
import Link from "next/link";

const Page = () => {
  return (
    <div className="flex flex-col gap-4">
      <CardBase
        title="Login to your account"
        description="Enter your email below to login to your account"
        content={
          <>
            <LoginForm />
            <div className="mt-2 text-center text-sm">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="underline underline-offset-4"
              >
                Sign up
              </Link>
            </div>
            <div className="mt-2 text-center text-sm">
              Forgot password?{" "}
              <Link
                href="/auth/recover"
                className="underline underline-offset-4"
              >
                Reset it
              </Link>
            </div>
          </>
        }
      />
    </div>
  );
};

export default Page;
