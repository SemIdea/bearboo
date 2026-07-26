import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import {
	IMediaStorageGatewayAdapter,
	ISavedMedia,
	ISaveMediaFileReq,
} from "../adapter";

const sanitizeFilename = (filename: string) =>
	filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");

class LocalMediaStorage implements IMediaStorageGatewayAdapter {
	constructor(private readonly uploadDir: string) {}

	async save({ buffer, filename }: ISaveMediaFileReq): Promise<ISavedMedia> {
		await mkdir(this.uploadDir, { recursive: true });

		const storageKey = `${randomUUID()}-${sanitizeFilename(filename)}`;
		await writeFile(path.join(this.uploadDir, storageKey), buffer);

		return { url: `/uploads/${storageKey}`, storageKey };
	}

	async delete(storageKey: string): Promise<void> {
		await unlink(path.join(this.uploadDir, storageKey)).catch(() => undefined);
	}
}

export { LocalMediaStorage };
