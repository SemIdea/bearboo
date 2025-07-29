import { createDynamicCaller } from "@/server/caller";
import { UpdateUserForm } from "./page.client";
import { CardComponent } from "@/components/card";

const Page = async () => {
  const { ctx } = await createDynamicCaller();

  const { user } = ctx;

  return (
    <CardComponent
      title={"Update Profile"}
      content={<UpdateUserForm user={user} />}
    />
  );
};

export default Page;
