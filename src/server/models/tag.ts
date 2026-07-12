import { prisma } from "@/server/infra/drivers/prisma";
import { BaseModel } from "./base";

type ITagEntity = {
	id: string;
	name: string;
	slug: string;
};

class TagModelClass extends BaseModel<ITagEntity> {
	constructor() {
		super(prisma.tag);
	}

	async readByName(name: string): Promise<ITagEntity | null> {
		return prisma.tag.findUnique({ where: { name } });
	}

	async readAll(): Promise<ITagEntity[]> {
		return prisma.tag.findMany({ orderBy: { name: "asc" } });
	}
}

const TagModel = new TagModelClass();

type ITagModel = BaseModel<ITagEntity> & {
	readByName: (name: string) => Promise<ITagEntity | null>;
	readAll: () => Promise<ITagEntity[]>;
};

export type { ITagEntity, ITagModel };
export { TagModel };
