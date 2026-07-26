import { prisma } from "@/server/infra/drivers/prisma";
import { BaseModel } from "./base";

type IMediaEntity = {
	id: string;
	url: string;
	storageKey: string;
	filename: string;
	mimeType: string;
	size: number;
	altText: string | null;
	uploadedById: string;
	createdAt: Date;
};

class MediaModelClass extends BaseModel<IMediaEntity> {
	constructor() {
		super(prisma.media);
	}

	async readByUser(uploadedById: string | null): Promise<IMediaEntity[]> {
		return prisma.media.findMany({
			where: uploadedById ? { uploadedById } : undefined,
			orderBy: { createdAt: "desc" },
		});
	}
}

const MediaModel = new MediaModelClass();

type IMediaModel = BaseModel<IMediaEntity> & {
	readByUser: (uploadedById: string | null) => Promise<IMediaEntity[]>;
};

export type { IMediaEntity, IMediaModel };
export { MediaModel };
