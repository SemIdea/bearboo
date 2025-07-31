import { createDynamicCaller } from "@/server/caller";
import { UpdateUserForm } from "./page.client";
import { CardBase } from "@/components/cardBase";

const Page = async () => {
  const { ctx } = await createDynamicCaller();

  const { user } = ctx;

  return (
    <CardBase
      title={"Update Profile"}
      content={<UpdateUserForm user={user} />}
    />
  );
};

export default Page;
