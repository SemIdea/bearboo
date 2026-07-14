type IRssPost = {
	title: string;
	content: string;
	slug: string;
	createdAt: Date;
};

type IBuildRssXmlInput = {
	siteUrl: string;
	title: string;
	description: string;
	posts: IRssPost[];
};

const RSS_DESCRIPTION_LENGTH = 300;

const escapeXml = (value: string): string =>
	value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const buildRssItem = (post: IRssPost, siteUrl: string): string => {
	const link = `${siteUrl}/post/${post.slug}`;
	const description = escapeXml(post.content.slice(0, RSS_DESCRIPTION_LENGTH));

	return [
		"<item>",
		`<title>${escapeXml(post.title)}</title>`,
		`<link>${link}</link>`,
		`<guid>${link}</guid>`,
		`<description>${description}</description>`,
		`<pubDate>${post.createdAt.toUTCString()}</pubDate>`,
		"</item>",
	].join("");
};

const buildRssXml = ({
	siteUrl,
	title,
	description,
	posts,
}: IBuildRssXmlInput): string => {
	const items = posts.map((post) => buildRssItem(post, siteUrl)).join("");

	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<rss version="2.0">',
		"<channel>",
		`<title>${escapeXml(title)}</title>`,
		`<link>${siteUrl}</link>`,
		`<description>${escapeXml(description)}</description>`,
		items,
		"</channel>",
		"</rss>",
	].join("");
};

export type { IRssPost };
export { buildRssXml };
