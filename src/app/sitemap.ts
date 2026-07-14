import { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { env } from "@/lib/env";
import { createCaller } from "@/server/caller";

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
	"use cache";
	cacheLife("hours");
	cacheTag("posts");

	const caller = await createCaller();
	const entries = await caller.post.readSitemapEntries();
	const siteUrl = env.siteUrl;

	return [
		{
			url: siteUrl,
			changeFrequency: "daily",
			priority: 1,
		},
		...entries.map((entry) => ({
			url: `${siteUrl}/post/${entry.slug}`,
			lastModified: entry.updatedAt,
			changeFrequency: "weekly" as const,
			priority: 0.7,
		})),
	];
};

export default sitemap;
