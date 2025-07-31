import { CardBase } from "@/components/cardBase";
import { ResetPasswordForm } from "./page.client";

type Params = {
  params: {
    token: string;
  };
};

const Page = ({ params }: Params) => {
  const { token } = params;

  return (
    <CardBase
      title="Reset Password"
      description="Please enter your new password below."
      content={<ResetPasswordForm token={token} />}
    />
  );
};

export default Page;
