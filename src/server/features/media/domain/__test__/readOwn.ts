import { describe, expect, test } from "vitest";
import { createTestContext } from "@/test/context";
import { domain_readOwnMedia } from "../readOwn";
import { domain_uploadMedia } from "../upload";

const uploadFor = async (
	ctx: ReturnType<typeof createTestContext>,
	userId: string,
	filename: string,
) =>
	domain_uploadMedia({
		ctx,
		input: {
			file: new File(["bytes"], filename, { type: "image/png" }),
			altText: undefined,
			userId,
		},
	});

describe("domain_readOwnMedia", () => {
	test("an author sees only their own media", async () => {
		const ctx = createTestContext();
		const owner = await ctx.createNewUser();
		const other = await ctx.createNewUser();
		await uploadFor(ctx, owner.id, "mine.png");
		await uploadFor(ctx, other.id, "theirs.png");

		const result = await domain_readOwnMedia({
			ctx,
			input: { userId: owner.id, role: "AUTHOR" },
		});

		expect(result).toHaveLength(1);
		expect(result[0].uploadedById).toBe(owner.id);
	});

	test("an editor sees media from every user", async () => {
		const ctx = createTestContext();
		const editor = await ctx.createNewUser();
		const other = await ctx.createNewUser();
		await uploadFor(ctx, editor.id, "mine.png");
		await uploadFor(ctx, other.id, "theirs.png");

		const result = await domain_readOwnMedia({
			ctx,
			input: { userId: editor.id, role: "EDITOR" },
		});

		expect(result).toHaveLength(2);
	});
});
