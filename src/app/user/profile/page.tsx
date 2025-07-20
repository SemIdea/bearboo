import { createDynamicCaller } from "@/server/caller";
import { UpdateUserForm } from "./page.client";
import { redirect } from "next/navigation";

const Page = async () => {
  const { ctx } = await createDynamicCaller({
    pathName: "/user/profile"
  });

  const { user } = ctx;

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="w-[55%]">
        <UpdateUserForm user={user} />
      </div>
    </div>
  );
};

export default Page;
