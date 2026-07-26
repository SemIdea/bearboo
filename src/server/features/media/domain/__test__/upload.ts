import { describe, expect, test } from "vitest";
import { createTestContext } from "@/test/context";
import { domain_uploadMedia } from "../upload";

describe("domain_uploadMedia", () => {
	test("saves the file via the storage gateway and creates the media record", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		const file = new File(["fake-bytes"], "cover.jpg", {
			type: "image/jpeg",
		});

		const media = await domain_uploadMedia({
			ctx,
			input: { file, altText: "a nice cover", userId: user.id },
		});

		expect(media.filename).toBe("cover.jpg");
		expect(media.mimeType).toBe("image/jpeg");
		expect(media.altText).toBe("a nice cover");
		expect(media.uploadedById).toBe(user.id);
		expect(media.url).toMatch(/^\/uploads\//);
	});

	test("defaults altText to null when not provided", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		const file = new File(["fake-bytes"], "cover.jpg", {
			type: "image/jpeg",
		});

		const media = await domain_uploadMedia({
			ctx,
			input: { file, altText: undefined, userId: user.id },
		});

		expect(media.altText).toBeNull();
	});
});
