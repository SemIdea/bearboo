import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { LocalMediaStorage } from "../local";

describe("LocalMediaStorage", () => {
	let uploadDir: string;

	beforeEach(async () => {
		uploadDir = await mkdtemp(path.join(tmpdir(), "media-upload-test-"));
	});

	afterEach(async () => {
		await rm(uploadDir, { recursive: true, force: true });
	});

	test("saves the file to disk and returns a public url + storage key", async () => {
		const storage = new LocalMediaStorage(uploadDir, "http://localhost:3000");
		const buffer = Buffer.from("fake-image-bytes");

		const saved = await storage.save({
			buffer,
			filename: "my photo.jpg",
			mimeType: "image/jpeg",
		});

		expect(saved.storageKey).toMatch(/my_photo\.jpg$/);
		expect(saved.url).toBe(`http://localhost:3000/uploads/${saved.storageKey}`);
		expect(existsSync(path.join(uploadDir, saved.storageKey))).toBe(true);
		expect(await readFile(path.join(uploadDir, saved.storageKey))).toEqual(
			buffer,
		);
	});

	test("two uploads with the same filename get distinct storage keys", async () => {
		const storage = new LocalMediaStorage(uploadDir, "http://localhost:3000");
		const buffer = Buffer.from("fake-image-bytes");

		const first = await storage.save({
			buffer,
			filename: "cover.png",
			mimeType: "image/png",
		});
		const second = await storage.save({
			buffer,
			filename: "cover.png",
			mimeType: "image/png",
		});

		expect(first.storageKey).not.toBe(second.storageKey);
	});

	test("delete removes the file from disk", async () => {
		const storage = new LocalMediaStorage(uploadDir, "http://localhost:3000");
		const saved = await storage.save({
			buffer: Buffer.from("bytes"),
			filename: "gone.gif",
			mimeType: "image/gif",
		});

		await storage.delete(saved.storageKey);

		expect(existsSync(path.join(uploadDir, saved.storageKey))).toBe(false);
	});

	test("delete is a no-op when the file does not exist", async () => {
		const storage = new LocalMediaStorage(uploadDir, "http://localhost:3000");

		await expect(storage.delete("never-existed.jpg")).resolves.toBeUndefined();
	});
});
