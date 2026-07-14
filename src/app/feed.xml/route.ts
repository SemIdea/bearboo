import { cacheLife, cacheTag } from "next/cache";
import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { env } from "@/lib/env";
import { createCaller } from "@/server/caller";
import { buildRssXml } from "@/server/http/buildRssXml";

const RSS_FEED_SIZE = 20;

const readFeedXml = async (): Promise<string> => {
	"use cache";
	cacheLife("hours");
	cacheTag("posts");

	const caller = await createCaller();
	const { posts } = await caller.post.readRecent({ limit: RSS_FEED_SIZE });

	return buildRssXml({
		siteUrl: env.siteUrl,
		title: siteConfig.name,
		description: siteConfig.description,
		posts,
	});
};

const GET = async () => {
	const xml = await readFeedXml();

	return new NextResponse(xml, {
		headers: {
			"Content-Type": "application/rss+xml; charset=utf-8",
		},
	});
};

export { GET };
