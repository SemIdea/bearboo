import { beforeEach, describe, expect, test, vi } from "vitest";
import { MediaModel } from "../media";

const prismaMock = vi.hoisted(() => ({
	media: {
		create: vi.fn(),
		findUnique: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		findMany: vi.fn(),
	},
}));

vi.mock("@/server/infra/drivers/prisma", () => ({
	prisma: prismaMock,
}));

describe("MediaModel", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("reads media for a single user when uploadedById is given", async () => {
		const media = [{ id: "media-1", uploadedById: "user-1" }];
		prismaMock.media.findMany.mockResolvedValue(media);

		const result = await MediaModel.readByUser("user-1");

		expect(prismaMock.media.findMany).toHaveBeenCalledWith({
			where: { uploadedById: "user-1" },
			orderBy: { createdAt: "desc" },
		});
		expect(result).toEqual(media);
	});

	test("reads media across all users when uploadedById is null", async () => {
		const media = [
			{ id: "media-1", uploadedById: "user-1" },
			{ id: "media-2", uploadedById: "user-2" },
		];
		prismaMock.media.findMany.mockResolvedValue(media);

		const result = await MediaModel.readByUser(null);

		expect(prismaMock.media.findMany).toHaveBeenCalledWith({
			where: undefined,
			orderBy: { createdAt: "desc" },
		});
		expect(result).toEqual(media);
	});
});
