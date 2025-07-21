import { createDynamicCaller } from "@/server/caller";
import { UpdateUserForm } from "./page.client";

const Page = async () => {
  const { ctx } = await createDynamicCaller({
    pathName: "/user/profile"
  });

  const { user } = ctx;

  return (
    <div className="flex justify-center w-full">
      <div className="w-[55%]">
        <UpdateUserForm user={user} />
      </div>
    </div>
  );
};

export default Page;
