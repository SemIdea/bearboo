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
	categoryId: string | null;
	coverImageUrl: string | null;
	createdAt: Date;
	updatedAt: Date;
};

type IPostCategorySummary = {
	id: string;
	name: string;
	slug: string;
};

type IPostTagSummary = {
	id: string;
	name: string;
	slug: string;
};

type IPostEntityWithRelations = IPostEntity & {
	user: {
		id: string;
		name: string;
	};
	comments: {
		id: string;
	}[];
	category: IPostCategorySummary | null;
	tags: IPostTagSummary[];
};

type IPostEntityWithTaxonomy = IPostEntity & {
	category: IPostCategorySummary | null;
	tags: IPostTagSummary[];
};

const flattenTags = (postTags: { tag: IPostTagSummary }[]): IPostTagSummary[] =>
	postTags.map(({ tag }) => tag);

class PostModelClass extends BaseModel<IPostEntity> {
	constructor() {
		super(prisma.post);
	}

	async readRecents(
		count: number,
		cursor?: string,
		categoryId?: string,
		tagId?: string,
	): Promise<IPostEntityWithRelations[]> {
		const posts = await prisma.post.findMany({
			take: count,
			...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
			where: {
				status: "PUBLISHED",
				...(categoryId ? { categoryId } : {}),
				...(tagId ? { postTags: { some: { tagId } } } : {}),
			},
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
				category: true,
				postTags: {
					include: {
						tag: true,
					},
				},
			},
		});

		return posts.map(({ postTags, ...post }) => ({
			...post,
			tags: flattenTags(postTags),
		}));
	}

	async readRelated(
		postId: string,
		categoryId: string | null,
		tagIds: string[],
		limit: number,
	): Promise<IPostEntityWithRelations[]> {
		if (!categoryId && tagIds.length === 0) return [];

		const posts = await prisma.post.findMany({
			where: {
				id: { not: postId },
				status: "PUBLISHED",
				OR: [
					...(categoryId ? [{ categoryId }] : []),
					...(tagIds.length
						? [{ postTags: { some: { tagId: { in: tagIds } } } }]
						: []),
				],
			},
			take: limit,
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
				category: true,
				postTags: {
					include: {
						tag: true,
					},
				},
			},
		});

		return posts.map(({ postTags, ...post }) => ({
			...post,
			tags: flattenTags(postTags),
		}));
	}

	async readUserPosts(userId: string): Promise<IPostEntity[]> {
		return prisma.post.findMany({
			where: {
				userId,
				status: "PUBLISHED",
			},
		});
	}

	async readBySlug(slug: string): Promise<IPostEntityWithTaxonomy | null> {
		const post = await prisma.post.findUnique({
			where: {
				slug,
			},
			include: {
				category: true,
				postTags: {
					include: {
						tag: true,
					},
				},
			},
		});

		if (!post) return null;

		const { postTags, ...rest } = post;

		return { ...rest, tags: flattenTags(postTags) };
	}

	async setTags(postId: string, tagIds: string[]): Promise<void> {
		await prisma.$transaction([
			prisma.postTag.deleteMany({ where: { postId } }),
			prisma.postTag.createMany({
				data: tagIds.map((tagId) => ({ postId, tagId })),
			}),
		]);
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
		categoryId?: string,
		tagId?: string,
	) => Promise<IPostEntityWithRelations[]>;
	readUserPosts: (userId: string) => Promise<IPostEntity[]>;
	readBySlug: (slug: string) => Promise<IPostEntityWithTaxonomy | null>;
	readRelated: (
		postId: string,
		categoryId: string | null,
		tagIds: string[],
		limit: number,
	) => Promise<IPostEntityWithRelations[]>;
	setTags: (postId: string, tagIds: string[]) => Promise<void>;
};

export type {
	IPostCategorySummary,
	IPostEntity,
	IPostEntityWithRelations,
	IPostEntityWithTaxonomy,
	IPostModel,
	IPostStatus,
	IPostTagSummary,
};
export { PostModel };
