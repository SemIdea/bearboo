import { describe, expect, test } from "vitest";
import { buildArticleJsonLd } from "../buildArticleJsonLd";

const baseInput = {
	siteUrl: "https://bearboo.dev",
	slug: "my-post",
	title: "My Post",
	description: "A short description",
	imageUrl: null,
	authorName: "Jane Doe",
	createdAt: new Date("2026-07-01T12:00:00.000Z"),
	updatedAt: new Date("2026-07-02T12:00:00.000Z"),
};

describe("buildArticleJsonLd Unitary Testing", () => {
	test("Should build a valid schema.org Article JSON-LD", () => {
		const json = buildArticleJsonLd(baseInput);
		const parsed = JSON.parse(json);

		expect(parsed["@context"]).toBe("https://schema.org");
		expect(parsed["@type"]).toBe("Article");
		expect(parsed.headline).toBe("My Post");
		expect(parsed.datePublished).toBe("2026-07-01T12:00:00.000Z");
		expect(parsed.dateModified).toBe("2026-07-02T12:00:00.000Z");
		expect(parsed.author).toEqual({ "@type": "Person", name: "Jane Doe" });
		expect(parsed.mainEntityOfPage).toBe("https://bearboo.dev/post/my-post");
	});

	test("Should omit image when there is no cover image", () => {
		const parsed = JSON.parse(buildArticleJsonLd(baseInput));

		expect(parsed.image).toBeUndefined();
	});

	test("Should include image when a cover image is present", () => {
		const parsed = JSON.parse(
			buildArticleJsonLd({
				...baseInput,
				imageUrl: "https://bearboo.dev/cover.jpg",
			}),
		);

		expect(parsed.image).toEqual(["https://bearboo.dev/cover.jpg"]);
	});

	test("Should escape '<' so the output can't break out of a script tag", () => {
		const json = buildArticleJsonLd({
			...baseInput,
			title: "</script><script>alert(1)</script>",
		});

		expect(json).not.toContain("</script>");
		expect(JSON.parse(json).headline).toBe(
			"</script><script>alert(1)</script>",
		);
	});
});
