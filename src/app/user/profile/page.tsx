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
      <h2>Edit Profile</h2>
      <UpdateUserForm user={user} />
    </div>
  );
};

export default Page;
