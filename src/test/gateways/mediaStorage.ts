import {
	IMediaStorageGatewayAdapter,
	ISavedMedia,
	ISaveMediaFileReq,
} from "@/server/integrations/gateway/mediaStorage/adapter";

class FakeMediaStorageGateway implements IMediaStorageGatewayAdapter {
	private readonly files = new Map<string, Buffer>();
	private sequence = 0;

	async save({ buffer, filename }: ISaveMediaFileReq): Promise<ISavedMedia> {
		this.sequence += 1;
		const storageKey = `fake-${this.sequence}-${filename}`;
		this.files.set(storageKey, buffer);

		return { url: `http://localhost:3000/uploads/${storageKey}`, storageKey };
	}

	async delete(storageKey: string): Promise<void> {
		this.files.delete(storageKey);
	}

	has(storageKey: string): boolean {
		return this.files.has(storageKey);
	}
}

export { FakeMediaStorageGateway };
