import { prisma } from "@/server/infra/drivers/prisma";
import { BaseModel } from "./base";

type ICategoryEntity = {
	id: string;
	name: string;
	slug: string;
};

class CategoryModelClass extends BaseModel<ICategoryEntity> {
	constructor() {
		super(prisma.category);
	}

	async readByName(name: string): Promise<ICategoryEntity | null> {
		return prisma.category.findUnique({ where: { name } });
	}

	async readAll(): Promise<ICategoryEntity[]> {
		return prisma.category.findMany({ orderBy: { name: "asc" } });
	}
}

const CategoryModel = new CategoryModelClass();

type ICategoryModel = BaseModel<ICategoryEntity> & {
	readByName: (name: string) => Promise<ICategoryEntity | null>;
	readAll: () => Promise<ICategoryEntity[]>;
};

export type { ICategoryEntity, ICategoryModel };
export { CategoryModel };
