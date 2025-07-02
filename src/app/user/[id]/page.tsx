import { UpdateUserSection, UserComments, UserPosts } from "./page.client";
import { createCaller } from "@/server/caller";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const Page = async (props: PageProps) => {
  const params = await props.params;
  const caller = await createCaller();

  const { id } = params;

  const user = await caller.user.read({ id });

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <h2 className="text-2xl font-semibold">User Profile</h2>

      <div className="text-center">
        <p>Email: {user.email}</p>
        <p>Name: {user.name}</p>
        <p>Bio: {user.bio}</p>
        <p>Id: {user.id}</p>
      </div>

      <UserPosts id={id} />
      <UserComments id={id} />
      <UpdateUserSection id={id} />
    </div>
  );
};

export default Page;
