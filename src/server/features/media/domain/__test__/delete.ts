import { describe, expect, test } from "vitest";
import { createTestContext } from "@/test/context";
import { FakeMediaStorageGateway } from "@/test/gateways/mediaStorage";
import { DomainError } from "@/shared/error/domainError";
import { MediaErrorCode } from "@/shared/error/media";
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
				userId: owner.id,
			},
		});

		await expect(
			domain_deleteMedia({
				ctx,
				input: { id: media.id, userId: other.id, role: "AUTHOR" },
			}),
		).rejects.toMatchObject(
			new DomainError(MediaErrorCode.MEDIA_DELETE_FORBIDDEN),
		);
	});

	test("an editor can delete another user's media via bypass", async () => {
		const ctx = createTestContext();
		const owner = await ctx.createNewUser();
		const editor = await ctx.createNewUser();
		const media = await domain_uploadMedia({
			ctx,
			input: {
				file: new File(["bytes"], "mine.png", { type: "image/png" }),
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
		).rejects.toMatchObject(new DomainError(MediaErrorCode.MEDIA_NOT_FOUND));
	});
});
