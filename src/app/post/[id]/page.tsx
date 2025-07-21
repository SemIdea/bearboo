import { Post } from "./page.client";
import { createCaller } from "@/server/caller";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const revalidate = 3600; // 1 hour
export const dynamic = "error";

const Page = async (props: PageProps) => {
  const params = await props.params;
  const caller = await createCaller();

  const { id } = params;

  const post = await caller.post.read({ id: id });
  const user = await caller.user.read({ id: post.userId });

  return (
    <div className="flex justify-center w-full">
      <div className="w-[55%]">
        <Post post={post} user={user} />
      </div>
    </div>
  );
};

export default Page;
