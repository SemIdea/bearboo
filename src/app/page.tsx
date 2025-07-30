import { PostFeed } from "@/components/postFeed";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

const Home = async () => {
  return (
    <div className="w-[55%]">
      <Suspense fallback={<p>Loading posts...</p>}>
        <PostFeed />
      </Suspense>
    </div>
  );
};

export default Home;
