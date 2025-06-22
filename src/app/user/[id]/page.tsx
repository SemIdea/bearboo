import { createCaller } from "@/server/caller";
import { UserComments, UserPosts } from "./page.client";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const Page = async (props: PageProps) => {
  const params = await props.params;
  const caller = createCaller();

  const { id } = params;

  const user = await caller.user.profile({ userId: id });

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <h2 className="text-2xl font-semibold">User Profile</h2>

      <div className="text-center">
        <p>Email: {user.email}</p>
        <p>Id: {user.id}</p>
      </div>

      <UserPosts />
      <UserComments />
    </div>
  );
};

export default Page;
