import { CardBase } from "@/components/cardBase";
import { SendResetPasswordEmailForm } from "./page.client";

const Page = () => {
  return (
    <CardBase
      title="Recover Password"
      description="Enter your email below to recover your password."
      content={<SendResetPasswordEmailForm />}
    />
  );
};

export default Page;
