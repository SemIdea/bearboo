import { createCaller, createDynamicCaller } from "@/server/caller";
import { UpdatePostForm } from "./page.client";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const Page = async (props: PageProps) => {
  const params = await props.params;
  const { id } = params;

  const { caller, ctx } = await createDynamicCaller({
    pathName: `/post/edit/${id}`
  });

  const user = ctx.user;
  const post = await caller.post.read({ id });

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <h2>Edit Post</h2>
      {JSON.stringify(ctx.user, null, 2)}
      <UpdatePostForm post={post} />
    </div>
  );
};

export default Page;
