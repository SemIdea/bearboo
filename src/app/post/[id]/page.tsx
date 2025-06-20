import Link from "next/link";
import { Post } from "@prisma/client";
import { Comments, PostMDView } from "./page.client";
import { CreateCommentSection } from "@/components/createCommentComment";
import { createCaller } from "@/server/caller";

const Page = async ({ params }: { params: { id: string } }) => {
  const caller = createCaller();

  const { id } = await params;

  const post: Post | null = await caller.post.findPost({ postId: id });

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <h2>Post Details</h2>
      <>
        <div>
          <h3>{post.title}</h3>
          <PostMDView source={post.content} />
        </div>
        <div>
          <Link href={`/user/${post.userId}`}>Author: {post.userId}</Link>
        </div>
        <Comments />
        <CreateCommentSection />
      </>
    </div>
  );
};

export default Page;
