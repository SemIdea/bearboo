"use client";

import Link from "next/link";
import { trpc } from "@/app/_trpc/client";

const REFERRER_BUCKET_LABEL: Record<string, string> = {
	DIRECT: "Direct",
	SEARCH: "Search",
	SOCIAL: "Social",
	OTHER: "Other",
};

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
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap gap-4">
				<div className="flex flex-col rounded-lg border p-4">
					<span className="text-sm text-muted-foreground">Total views</span>
					<span className="text-2xl font-semibold">{data.totalViews}</span>
				</div>
				<div className="flex flex-col rounded-lg border p-4">
					<span className="text-sm text-muted-foreground">Last 7 days</span>
					<span className="text-2xl font-semibold">{data.viewsLast7Days}</span>
				</div>
				<div className="flex flex-col rounded-lg border p-4">
					<span className="text-sm text-muted-foreground">Last 30 days</span>
					<span className="text-2xl font-semibold">{data.viewsLast30Days}</span>
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<p className="text-lg font-semibold">Most viewed posts</p>
				<ol className="flex flex-col gap-2">
					{data.posts.map((post, index) => (
						<li
							key={post.id}
							className="flex items-center justify-between gap-2"
						>
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

			{data.trafficOrigin.length > 0 && (
				<div className="flex flex-col gap-2">
					<p className="text-lg font-semibold">Traffic origin (last 30 days)</p>
					<ul className="flex flex-col gap-1">
						{data.trafficOrigin.map((entry) => (
							<li
								key={entry.bucket}
								className="flex items-center justify-between gap-2"
							>
								<span>
									{REFERRER_BUCKET_LABEL[entry.bucket] ?? entry.bucket}
								</span>
								<span className="text-sm text-muted-foreground">
									{entry.count} views
								</span>
							</li>
						))}
					</ul>
				</div>
			)}

			{data.browsers.length > 0 && (
				<div className="flex flex-col gap-2">
					<p className="text-lg font-semibold">Browsers (last 30 days)</p>
					<ul className="flex flex-col gap-1">
						{data.browsers.map((entry) => (
							<li
								key={entry.name}
								className="flex items-center justify-between gap-2"
							>
								<span>{entry.name}</span>
								<span className="text-sm text-muted-foreground">
									{entry.count} views
								</span>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};

export { AnalyticsDashboard };
