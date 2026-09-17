import { Suspense } from "react";
import { PostFeed } from "@/components/postFeed";
import { buildHomeMetadata } from "@/lib/seo/metadata";

export const metadata = buildHomeMetadata();

const Home = async () => {
	return (
		<div className="flex w-[55%] flex-col gap-4">
			<h1 className="text-2xl font-bold">Latest posts</h1>
			<Suspense fallback={<p>Loading posts...</p>}>
				<PostFeed />
			</Suspense>
		</div>
	);
};

export default Home;
