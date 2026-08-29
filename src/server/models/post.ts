import { Prisma } from "@prisma/client";
import { prisma } from "@/server/infra/drivers/prisma";
import { BaseModel } from "./base";

type IPostStatus =
	| "DRAFT"
	| "IN_REVIEW"
	| "SCHEDULED"
	| "PUBLISHED"
	| "ARCHIVED";

type IPostEntity = {
	id: string;
	userId: string;
	title: string;
	content: string;
	slug: string;
	previousSlug: string | null;
	seoTitle: string | null;
	seoDescription: string | null;
	canonicalUrl: string | null;
	status: IPostStatus;
	scheduledAt: Date | null;
	categoryId: string | null;
	coverImageUrl: string | null;
	viewCount: number;
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

type IPostMostViewedEntry = {
	id: string;
	title: string;
	slug: string;
	viewCount: number;
};

type IPostSitemapEntry = {
	slug: string;
	updatedAt: Date;
};

type IPostSearchSortBy = "recent" | "mostViewed" | "relevance";

const flattenTags = (postTags: { tag: IPostTagSummary }[]): IPostTagSummary[] =>
	postTags.map(({ tag }) => tag);

const publicVisibilityFilter = () => [
	{ status: "PUBLISHED" as const },
	{ status: "SCHEDULED" as const, scheduledAt: { lte: new Date() } },
];

const postRelationsInclude = {
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
} as const;

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
				OR: publicVisibilityFilter(),
				...(categoryId ? { categoryId } : {}),
				...(tagId ? { postTags: { some: { tagId } } } : {}),
			},
			orderBy: {
				createdAt: "desc",
			},
			include: postRelationsInclude,
		});

		return posts.map(({ postTags, ...post }) => ({
			...post,
			tags: flattenTags(postTags),
		}));
	}

	async search(
		query: string,
		count: number,
		cursor?: string,
		categoryId?: string,
		tagId?: string,
		sortBy: IPostSearchSortBy = "relevance",
	): Promise<IPostEntityWithRelations[]> {
		// Native full-text (ADR-0027): match by tsvector `@@`, rank by ts_rank.
		// Matching is consistent across sorts; only the ORDER differs. Raw SQL is
		// confined to this data-layer model (rule 30). Cursor stays a post id —
		// keyset compares against the cursor row's own sort key (subselect).
		const categoryFilter = categoryId
			? Prisma.sql`AND p."categoryId" = ${categoryId}`
			: Prisma.empty;
		const tagFilter = tagId
			? Prisma.sql`AND EXISTS (SELECT 1 FROM "PostTag" pt WHERE pt."postId" = p.id AND pt."tagId" = ${tagId})`
			: Prisma.empty;

		const sortKey =
			sortBy === "recent"
				? Prisma.sql`created_at`
				: sortBy === "mostViewed"
					? Prisma.sql`view_count`
					: Prisma.sql`rank`;
		const orderBy = Prisma.sql`${sortKey} DESC, id DESC`;
		const keyset = cursor
			? Prisma.sql`WHERE (${sortKey}, id) < ((SELECT ${sortKey} FROM matched WHERE id = ${cursor}), ${cursor})`
			: Prisma.empty;

		const ranked = await prisma.$queryRaw<Array<{ id: string }>>`
			WITH q AS (SELECT websearch_to_tsquery('english', ${query}) AS query),
			matched AS (
				SELECT p.id,
				       ts_rank(p."searchVector", q.query) AS rank,
				       p."createdAt" AS created_at,
				       p."viewCount" AS view_count
				FROM "Post" p, q
				WHERE p."searchVector" @@ q.query
				  AND (p.status = 'PUBLISHED' OR (p.status = 'SCHEDULED' AND p."scheduledAt" <= now()))
				  ${categoryFilter}
				  ${tagFilter}
			)
			SELECT id FROM matched
			${keyset}
			ORDER BY ${orderBy}
			LIMIT ${count}
		`;

		const ids = ranked.map((row) => row.id);
		if (ids.length === 0) return [];

		// Hydrate with the relations the callers expect, then restore the ranked
		// order (findMany does not preserve the `in` order).
		const posts = await prisma.post.findMany({
			where: { id: { in: ids } },
			include: postRelationsInclude,
		});
		const byId = new Map(posts.map((post) => [post.id, post]));

		return ids
			.map((id) => byId.get(id))
			.filter((post): post is (typeof posts)[number] => post !== undefined)
			.map(({ postTags, ...post }) => ({
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
				AND: [
					{ OR: publicVisibilityFilter() },
					{
						OR: [
							...(categoryId ? [{ categoryId }] : []),
							...(tagIds.length
								? [{ postTags: { some: { tagId: { in: tagIds } } } }]
								: []),
						],
					},
				],
			},
			take: limit,
			orderBy: {
				createdAt: "desc",
			},
			include: postRelationsInclude,
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
				OR: publicVisibilityFilter(),
			},
		});
	}

	async readOwnPosts(
		userId: string | null,
		status?: IPostStatus,
		categoryId?: string,
		tagId?: string,
	): Promise<IPostEntityWithRelations[]> {
		const posts = await prisma.post.findMany({
			where: {
				...(userId ? { userId } : {}),
				...(status ? { status } : {}),
				...(categoryId ? { categoryId } : {}),
				...(tagId ? { postTags: { some: { tagId } } } : {}),
			},
			orderBy: {
				createdAt: "desc",
			},
			include: postRelationsInclude,
		});

		return posts.map(({ postTags, ...post }) => ({
			...post,
			tags: flattenTags(postTags),
		}));
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

	async readByPreviousSlug(slug: string): Promise<{ slug: string } | null> {
		const post = await prisma.post.findUnique({
			where: {
				previousSlug: slug,
			},
			select: {
				slug: true,
			},
		});

		return post;
	}

	async readAllPublicSlugs(): Promise<IPostSitemapEntry[]> {
		return prisma.post.findMany({
			where: {
				OR: publicVisibilityFilter(),
			},
			select: {
				slug: true,
				updatedAt: true,
			},
			orderBy: {
				updatedAt: "desc",
			},
		});
	}

	async readIfPubliclyVisible(postId: string): Promise<IPostEntity | null> {
		return prisma.post.findFirst({
			where: {
				id: postId,
				OR: publicVisibilityFilter(),
			},
		});
	}

	async applyViewIncrements(deltas: Record<string, number>): Promise<void> {
		await Promise.all(
			Object.entries(deltas).map(([postId, delta]) =>
				prisma.post.update({
					where: { id: postId },
					data: { viewCount: { increment: delta } },
				}),
			),
		);
	}

	async readMostViewed(limit: number): Promise<IPostMostViewedEntry[]> {
		return prisma.post.findMany({
			orderBy: {
				viewCount: "desc",
			},
			take: limit,
			select: {
				id: true,
				title: true,
				slug: true,
				viewCount: true,
			},
		});
	}

	async readTotalViews(): Promise<number> {
		const result = await prisma.post.aggregate({
			_sum: { viewCount: true },
		});

		return result._sum.viewCount ?? 0;
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
	search: (
		query: string,
		count: number,
		cursor?: string,
		categoryId?: string,
		tagId?: string,
		sortBy?: IPostSearchSortBy,
	) => Promise<IPostEntityWithRelations[]>;
	readUserPosts: (userId: string) => Promise<IPostEntity[]>;
	readOwnPosts: (
		userId: string | null,
		status?: IPostStatus,
		categoryId?: string,
		tagId?: string,
	) => Promise<IPostEntityWithRelations[]>;
	readBySlug: (slug: string) => Promise<IPostEntityWithTaxonomy | null>;
	readByPreviousSlug: (slug: string) => Promise<{ slug: string } | null>;
	readAllPublicSlugs: () => Promise<IPostSitemapEntry[]>;
	readRelated: (
		postId: string,
		categoryId: string | null,
		tagIds: string[],
		limit: number,
	) => Promise<IPostEntityWithRelations[]>;
	setTags: (postId: string, tagIds: string[]) => Promise<void>;
	readIfPubliclyVisible: (postId: string) => Promise<IPostEntity | null>;
	applyViewIncrements: (deltas: Record<string, number>) => Promise<void>;
	readMostViewed: (limit: number) => Promise<IPostMostViewedEntry[]>;
	readTotalViews: () => Promise<number>;
};

export type {
	IPostCategorySummary,
	IPostEntity,
	IPostEntityWithRelations,
	IPostEntityWithTaxonomy,
	IPostModel,
	IPostMostViewedEntry,
	IPostSearchSortBy,
	IPostSitemapEntry,
	IPostStatus,
	IPostTagSummary,
};
export { PostModel };
