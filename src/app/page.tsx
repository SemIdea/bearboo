import { PostFeed } from "@/components/postFeed";
import { Suspense } from "react";

export const experimental_ppr = true;

const Home = async () => {
  return (
    <div className="flex justify-center w-full">
      <div className="w-[55%]">
        <Suspense fallback={<p>Loading posts...</p>}>
          <PostFeed />
        </Suspense>
      </div>
    </div>
  );
};

export default Home;
