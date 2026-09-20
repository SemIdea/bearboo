import { beforeEach, describe, expect, test, vi } from "vitest";
import { PostModel } from "../post";

const prismaMock = vi.hoisted(() => ({
	post: {
		count: vi.fn(),
	},
}));

vi.mock("@/server/infra/drivers/prisma", () => ({
	prisma: prismaMock,
}));

describe("PostModel.existsBySlug", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("returns true when the slug exists, whatever the post status", async () => {
		prismaMock.post.count.mockResolvedValue(1);

		await expect(PostModel.existsBySlug("some-slug")).resolves.toBe(true);
		expect(prismaMock.post.count).toHaveBeenCalledWith({
			where: { slug: "some-slug" },
		});
	});

	test("returns false when the slug does not exist", async () => {
		prismaMock.post.count.mockResolvedValue(0);

		await expect(PostModel.existsBySlug("missing")).resolves.toBe(false);
	});
});
