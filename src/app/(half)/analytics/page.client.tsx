"use client";

import Link from "next/link";
import { trpc } from "@/app/_trpc/client";

const AnalyticsDashboard = () => {
	const { data, isLoading, error } = trpc.analytics.readDashboard.useQuery();

	if (isLoading) {
		return <p>Loading analytics...</p>;
	}

	if (error) {
		return <p>You don&apos;t have access to this page.</p>;
	}

	if (!data || data.posts.length === 0) {
		return <p>No views recorded yet.</p>;
	}

	return (
		<div className="flex flex-col gap-4">
			<p className="text-lg font-semibold">Total views: {data.totalViews}</p>
			<ol className="flex flex-col gap-2">
				{data.posts.map((post, index) => (
					<li key={post.id} className="flex items-center justify-between gap-2">
						<span>
							{index + 1}.{" "}
							<Link href={`/post/${post.slug}`} className="hover:underline">
								{post.title}
							</Link>
						</span>
						<span className="text-sm text-muted-foreground">
							{post.viewCount} views
						</span>
					</li>
				))}
			</ol>
		</div>
	);
};

export { AnalyticsDashboard };
