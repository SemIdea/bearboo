type ISaveMediaFileReq = {
	buffer: Buffer;
	filename: string;
	mimeType: string;
};

type ISavedMedia = {
	url: string;
	storageKey: string;
};

type IMediaStorageGatewayAdapter = {
	save: (req: ISaveMediaFileReq) => Promise<ISavedMedia>;
	delete: (storageKey: string) => Promise<void>;
};

export type { IMediaStorageGatewayAdapter, ISavedMedia, ISaveMediaFileReq };
