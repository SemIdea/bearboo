import { createDynamicCaller } from "@/server/caller";
import { UpdatePostForm } from "./page.client";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const Page = async (props: PageProps) => {
  const params = await props.params;
  const { id } = params;

  const { caller } = await createDynamicCaller({
    pathName: `/post/edit/${id}`
  });

  const post = await caller.post.read({ id });

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-[55%]">
        <UpdatePostForm post={post} />
      </div>
    </div>
  );
};

export default Page;
