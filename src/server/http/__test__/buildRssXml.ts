import { describe, expect, test } from "vitest";
import { buildRssXml } from "../buildRssXml";

describe("buildRssXml Unitary Testing", () => {
	test("Should build a valid RSS 2.0 envelope with the channel metadata", () => {
		const xml = buildRssXml({
			siteUrl: "https://bearboo.dev",
			title: "Bearboo",
			description: "Blog técnico pessoal",
			posts: [],
		});

		expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
		expect(xml).toContain('<rss version="2.0">');
		expect(xml).toContain("<title>Bearboo</title>");
		expect(xml).toContain("<link>https://bearboo.dev</link>");
	});

	test("Should turn each post into an item with title, link, guid and pubDate", () => {
		const createdAt = new Date("2026-07-01T12:00:00.000Z");
		const xml = buildRssXml({
			siteUrl: "https://bearboo.dev",
			title: "Bearboo",
			description: "Blog técnico pessoal",
			posts: [
				{
					title: "My Post",
					content: "Post content",
					slug: "my-post",
					createdAt,
				},
			],
		});

		expect(xml).toContain("<item>");
		expect(xml).toContain("<title>My Post</title>");
		expect(xml).toContain("<link>https://bearboo.dev/post/my-post</link>");
		expect(xml).toContain("<guid>https://bearboo.dev/post/my-post</guid>");
		expect(xml).toContain(`<pubDate>${createdAt.toUTCString()}</pubDate>`);
	});

	test("Should escape XML-unsafe characters in title and description", () => {
		const xml = buildRssXml({
			siteUrl: "https://bearboo.dev",
			title: "Bearboo",
			description: "Blog técnico pessoal",
			posts: [
				{
					title: "A & B <script>",
					content: "content",
					slug: "a-b",
					createdAt: new Date(),
				},
			],
		});

		expect(xml).toContain("<title>A &amp; B &lt;script&gt;</title>");
		expect(xml).not.toContain("<script>");
	});
});
