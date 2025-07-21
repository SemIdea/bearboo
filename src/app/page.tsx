import { PostFeed } from "@/components/postFeed";
import { createCaller } from "@/server/caller";

const Home = async () => {
  const caller = await createCaller();

  const posts = await caller.post.readRecent();

  return (
    <div className="flex justify-center w-full">
      <div className="w-[55%]">
        <PostFeed posts={posts} />
      </div>
    </div>
  );
};

export default Home;
