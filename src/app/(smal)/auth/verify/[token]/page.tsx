import { CardBase } from "@/components/cardBase";
import { VerifyForm } from "./page.client";

type Params = {
  params: Promise<{
    token: string;
  }>;
};

const Page = async ({ params }: Params) => {
  const { token } = await params;

  return (
    <CardBase
      title="Verify Your Email"
      description="Please enter the verification code sent to your email."
      content={<VerifyForm token={token} />}
    />
  );
};

export default Page;
