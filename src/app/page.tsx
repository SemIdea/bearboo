import { Suspense } from "react";
import { PostFeed } from "@/components/postFeed";
import { buildHomeMetadata } from "@/lib/seo/metadata";

export const metadata = buildHomeMetadata();

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
