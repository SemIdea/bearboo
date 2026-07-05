import { Suspense } from "react";
import { PostFeed } from "@/components/postFeed";

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
