import { prisma } from "@/server/infra/drivers/prisma";
import { BaseModel } from "./base";

type IPostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

type IPostEntity = {
	id: string;
	userId: string;
	title: string;
	content: string;
	slug: string;
	status: IPostStatus;
	createdAt: Date;
	updatedAt: Date;
};

type IPostEntityWithRelations = IPostEntity & {
	user: {
		id: string;
		name: string;
	};
	comments: {
		id: string;
	}[];
};

class PostModelClass extends BaseModel<IPostEntity> {
	constructor() {
		super(prisma.post);
	}

	async readRecents(
		count: number,
		cursor?: string,
	): Promise<IPostEntityWithRelations[]> {
		return prisma.post.findMany({
			take: count,
			...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
			where: { status: "PUBLISHED" },
			orderBy: {
				createdAt: "desc",
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
					},
				},
				comments: {
					select: {
						id: true,
					},
				},
			},
		});
	}

	async readUserPosts(userId: string): Promise<IPostEntity[]> {
		return prisma.post.findMany({
			where: {
				userId,
				status: "PUBLISHED",
			},
		});
	}

	async readBySlug(slug: string): Promise<IPostEntity | null> {
		return prisma.post.findUnique({
			where: {
				slug,
			},
		});
	}

	async delete(id: string): Promise<boolean> {
		try {
			await prisma.$transaction(async (tx) => {
				await tx.comment.deleteMany({
					where: {
						postId: id,
					},
				});

				await tx.post.delete({
					where: {
						id,
					},
				});
			});

			return true;
		} catch {
			return false;
		}
	}
}

const PostModel = new PostModelClass();

type IPostModel = BaseModel<IPostEntity> & {
	readRecents: (
		count: number,
		cursor?: string,
	) => Promise<IPostEntityWithRelations[]>;
	readUserPosts: (userId: string) => Promise<IPostEntity[]>;
	readBySlug: (slug: string) => Promise<IPostEntity | null>;
};

export type { IPostEntity, IPostEntityWithRelations, IPostModel, IPostStatus };
export { PostModel };
