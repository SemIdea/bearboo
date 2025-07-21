import Link from "next/link";
import { PostFeed } from "@/components/postFeed";
import { SearchPost } from "@/components/ui/searchPost";
import { createCaller } from "@/server/caller";

const Home = async () => {
  const caller = await createCaller();

  const posts = await caller.post.readRecent();

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="w-[55%]">
        <PostFeed posts={posts} />
      </div>
    </div>
  );
};

export default Home;
