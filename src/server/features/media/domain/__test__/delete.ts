import { describe, expect, test, vi } from "vitest";
import { AppError } from "@/shared/error/appError";
import { createTestContext, TestContext } from "@/test/context";
import { createFakeGateways } from "@/test/gateways";
import { FakeMediaStorageGateway } from "@/test/gateways/mediaStorage";
import { domain_deleteMedia } from "../delete";
import { domain_uploadMedia } from "../upload";

describe("domain_deleteMedia", () => {
	test("the owner can delete their own media, removing the physical file too", async () => {
		const ctx = createTestContext();
		const owner = await ctx.createNewUser();
		const media = await domain_uploadMedia({
			ctx,
			input: {
				file: new File(["bytes"], "mine.png", { type: "image/png" }),
				altText: undefined,
				userId: owner.id,
			},
		});
		const storage = ctx.gateways.mediaStorage as FakeMediaStorageGateway;
		expect(storage.has(media.storageKey)).toBe(true);

		const result = await domain_deleteMedia({
			ctx,
			input: { id: media.id, userId: owner.id, role: "AUTHOR" },
		});

		expect(result).toBe(true);
		expect(storage.has(media.storageKey)).toBe(false);
		expect(await ctx.repositories.media.read(media.id)).toBeNull();
	});

	test("an author without bypass cannot delete another user's media", async () => {
		const ctx = createTestContext();
		const owner = await ctx.createNewUser();
		const other = await ctx.createNewUser();
		const media = await domain_uploadMedia({
			ctx,
			input: {
				file: new File(["bytes"], "mine.png", { type: "image/png" }),
				altText: undefined,
				userId: owner.id,
			},
		});

		await expect(
			domain_deleteMedia({
				ctx,
				input: { id: media.id, userId: other.id, role: "AUTHOR" },
			}),
		).rejects.toMatchObject(new AppError("media.delete_forbidden"));
	});

	test("an editor can delete another user's media via bypass", async () => {
		const ctx = createTestContext();
		const owner = await ctx.createNewUser();
		const editor = await ctx.createNewUser();
		const media = await domain_uploadMedia({
			ctx,
			input: {
				file: new File(["bytes"], "mine.png", { type: "image/png" }),
				altText: undefined,
				userId: owner.id,
			},
		});

		const result = await domain_deleteMedia({
			ctx,
			input: { id: media.id, userId: editor.id, role: "EDITOR" },
		});

		expect(result).toBe(true);
	});

	test("deleting a nonexistent media throws MEDIA_NOT_FOUND", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();

		await expect(
			domain_deleteMedia({
				ctx,
				input: { id: "does-not-exist", userId: user.id, role: "AUTHOR" },
			}),
		).rejects.toMatchObject(new AppError("media.not_found"));
	});

	test("keeps the DB record when the storage delete fails", async () => {
		const ctx = createTestContext();
		const owner = await ctx.createNewUser();
		const media = await domain_uploadMedia({
			ctx,
			input: {
				file: new File(["bytes"], "mine.png", { type: "image/png" }),
				altText: undefined,
				userId: owner.id,
			},
		});

		const failingCtx = new TestContext({
			gateways: {
				...createFakeGateways(),
				mediaStorage: {
					save: vi.fn(),
					delete: vi.fn().mockRejectedValue(new Error("disk full")),
				},
			},
		});
		// TestContext.gateways is a per-instance seam, but the repositories
		// (Prisma models, mocked globally) are shared — the media created above
		// via `ctx` is visible through `failingCtx.repositories` too.

		await expect(
			domain_deleteMedia({
				ctx: failingCtx,
				input: { id: media.id, userId: owner.id, role: "AUTHOR" },
			}),
		).rejects.toThrow("disk full");

		expect(await ctx.repositories.media.read(media.id)).not.toBeNull();
	});
});
