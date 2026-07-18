import { beforeEach, describe, expect, test, vi } from "vitest";
import { PostViewModel } from "../postView";

const prismaMock = vi.hoisted(() => ({
	postView: {
		create: vi.fn(),
		count: vi.fn(),
		groupBy: vi.fn(),
		findMany: vi.fn(),
		deleteMany: vi.fn(),
	},
}));

vi.mock("@/server/infra/drivers/prisma", () => ({
	prisma: prismaMock,
}));

describe("PostViewModel", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("creates a raw view event", async () => {
		const event = {
			id: "view-1",
			postId: "post-1",
			referrerBucket: "SEARCH" as const,
			userAgent: "agent-a",
		};
		prismaMock.postView.create.mockResolvedValue(event);

		await PostViewModel.create("view-1", {
			postId: "post-1",
			referrerBucket: "SEARCH",
			userAgent: "agent-a",
		});

		expect(prismaMock.postView.create).toHaveBeenCalledWith({
			data: {
				id: "view-1",
				postId: "post-1",
				referrerBucket: "SEARCH",
				userAgent: "agent-a",
			},
		});
	});

	test("counts views since N days ago", async () => {
		prismaMock.postView.count.mockResolvedValue(7);

		const count = await PostViewModel.countSince(7);

		expect(prismaMock.postView.count).toHaveBeenCalledWith({
			where: { createdAt: { gte: expect.any(Date) } },
		});
		expect(count).toBe(7);
	});

	test("reads the referrer breakdown grouped by bucket within the window", async () => {
		prismaMock.postView.groupBy.mockResolvedValue([
			{ referrerBucket: "SEARCH", _count: { referrerBucket: 3 } },
			{ referrerBucket: "DIRECT", _count: { referrerBucket: 1 } },
		]);

		const breakdown = await PostViewModel.readReferrerBreakdown(30);

		expect(prismaMock.postView.groupBy).toHaveBeenCalledWith({
			by: ["referrerBucket"],
			where: { createdAt: { gte: expect.any(Date) } },
			_count: { referrerBucket: true },
		});
		expect(breakdown).toEqual([
			{ bucket: "SEARCH", count: 3 },
			{ bucket: "DIRECT", count: 1 },
		]);
	});

	test("reads raw user agents within the window", async () => {
		prismaMock.postView.findMany.mockResolvedValue([
			{ userAgent: "agent-a" },
			{ userAgent: "agent-b" },
		]);

		const userAgents = await PostViewModel.readUserAgents(30);

		expect(prismaMock.postView.findMany).toHaveBeenCalledWith({
			where: { createdAt: { gte: expect.any(Date) } },
			select: { userAgent: true },
		});
		expect(userAgents).toEqual(["agent-a", "agent-b"]);
	});

	test("deletes events older than N days", async () => {
		await PostViewModel.deleteOlderThan(30);

		expect(prismaMock.postView.deleteMany).toHaveBeenCalledWith({
			where: { createdAt: { lt: expect.any(Date) } },
		});
	});
});
