import { beforeEach, describe, expect, test, vi } from "vitest";
import { CategoryModel } from "../category";
import { CommentModel } from "../comment";
import { PostModel } from "../post";
import { ResetTokenModel } from "../resetToken";
import { SessionModel } from "../session";
import { TagModel } from "../tag";
import { UserModel } from "../user";
import { VerifyTokenModel } from "../verifyToken";

const prismaMock = vi.hoisted(() => ({
	user: {
		findUnique: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
	post: {
		findMany: vi.fn(),
		create: vi.fn(),
		findUnique: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
	comment: {
		findMany: vi.fn(),
		create: vi.fn(),
		findUnique: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		deleteMany: vi.fn(),
	},
	category: {
		findMany: vi.fn(),
		findUnique: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
	tag: {
		findMany: vi.fn(),
		findUnique: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
	postTag: {
		deleteMany: vi.fn(),
		createMany: vi.fn(),
	},
	session: {
		findFirst: vi.fn(),
		create: vi.fn(),
		findUnique: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
	resetToken: {
		findUnique: vi.fn(),
		findFirst: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
	verificationToken: {
		findUnique: vi.fn(),
		findFirst: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
	$transaction: vi.fn(),
}));

vi.mock("@/server/infra/drivers/prisma", () => ({
	prisma: prismaMock,
}));

describe("Prisma-backed models", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("UserModel reads users by email", async () => {
		const user = { id: "user-1", email: "user@example.com" };
		prismaMock.user.findUnique.mockResolvedValue(user);

		await expect(UserModel.readByEmail("user@example.com")).resolves.toBe(user);

		expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
			where: { email: "user@example.com" },
		});
	});

	const postIncludeShape = {
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
	};

	const publicVisibilityOr = [
		{ status: "PUBLISHED" },
		{ status: "SCHEDULED", scheduledAt: { lte: expect.any(Date) } },
	];

	test("PostModel reads recent posts with author and comment metadata", async () => {
		const posts = [{ id: "post-1", postTags: [] }];
		prismaMock.post.findMany.mockResolvedValue(posts);

		await expect(PostModel.readRecents(5)).resolves.toEqual([
			{ id: "post-1", tags: [] },
		]);

		expect(prismaMock.post.findMany).toHaveBeenCalledWith({
			take: 5,
			where: { OR: publicVisibilityOr },
			orderBy: { createdAt: "desc" },
			include: postIncludeShape,
		});
	});

	test("PostModel reads recent posts from a cursor", async () => {
		const posts = [{ id: "post-2", postTags: [] }];
		prismaMock.post.findMany.mockResolvedValue(posts);

		await expect(PostModel.readRecents(5, "post-1")).resolves.toEqual([
			{ id: "post-2", tags: [] },
		]);

		expect(prismaMock.post.findMany).toHaveBeenCalledWith({
			take: 5,
			cursor: { id: "post-1" },
			skip: 1,
			where: { OR: publicVisibilityOr },
			orderBy: { createdAt: "desc" },
			include: postIncludeShape,
		});
	});

	test("PostModel filters recent posts by categoryId and tagId", async () => {
		prismaMock.post.findMany.mockResolvedValue([]);

		await PostModel.readRecents(5, undefined, "category-1", "tag-1");

		expect(prismaMock.post.findMany).toHaveBeenCalledWith({
			take: 5,
			where: {
				OR: publicVisibilityOr,
				categoryId: "category-1",
				postTags: { some: { tagId: "tag-1" } },
			},
			orderBy: { createdAt: "desc" },
			include: postIncludeShape,
		});
	});

	// Search moved to native full-text (ADR-0027): the tsvector query runs raw
	// SQL prisma-mock cannot execute, so matching/ranking/filters/pagination are
	// covered in src/server/features/post/__itest__/search.integration.ts.

	test("PostModel reads posts by user", async () => {
		prismaMock.post.findMany.mockResolvedValue([]);

		await expect(PostModel.readUserPosts("user-1")).resolves.toEqual([]);

		expect(prismaMock.post.findMany).toHaveBeenCalledWith({
			where: { userId: "user-1", OR: publicVisibilityOr },
		});
	});

	test("PostModel reads all publicly visible slugs for the sitemap", async () => {
		const entries = [{ slug: "my-post", updatedAt: new Date("2026-07-01") }];
		prismaMock.post.findMany.mockResolvedValue(entries);

		await expect(PostModel.readAllPublicSlugs()).resolves.toEqual(entries);

		expect(prismaMock.post.findMany).toHaveBeenCalledWith({
			where: { OR: publicVisibilityOr },
			select: { slug: true, updatedAt: true },
			orderBy: { updatedAt: "desc" },
		});
	});

	test("PostModel reads a post by slug with category and tags", async () => {
		const tag = { id: "tag-1", name: "prisma", slug: "prisma" };
		prismaMock.post.findUnique.mockResolvedValue({
			id: "post-1",
			category: null,
			postTags: [{ tag }],
		});

		await expect(PostModel.readBySlug("my-post")).resolves.toEqual({
			id: "post-1",
			category: null,
			tags: [tag],
		});

		expect(prismaMock.post.findUnique).toHaveBeenCalledWith({
			where: { slug: "my-post" },
			include: {
				category: true,
				postTags: { include: { tag: true } },
			},
		});
	});

	test("PostModel returns null when the slug does not exist", async () => {
		prismaMock.post.findUnique.mockResolvedValue(null);

		await expect(PostModel.readBySlug("missing")).resolves.toBeNull();
	});

	test("PostModel replaces a post's tags in one transaction", async () => {
		prismaMock.$transaction.mockResolvedValue(undefined);
		prismaMock.postTag.deleteMany.mockReturnValue("delete-op");
		prismaMock.postTag.createMany.mockReturnValue("create-op");

		await PostModel.setTags("post-1", ["tag-1", "tag-2"]);

		expect(prismaMock.postTag.deleteMany).toHaveBeenCalledWith({
			where: { postId: "post-1" },
		});
		expect(prismaMock.postTag.createMany).toHaveBeenCalledWith({
			data: [
				{ postId: "post-1", tagId: "tag-1" },
				{ postId: "post-1", tagId: "tag-2" },
			],
		});
		expect(prismaMock.$transaction).toHaveBeenCalledWith([
			"delete-op",
			"create-op",
		]);
	});

	test("PostModel deletes comments and post in one transaction", async () => {
		prismaMock.$transaction.mockImplementation(
			async (
				callback: (tx: {
					comment: { deleteMany: typeof prismaMock.comment.deleteMany };
					post: { delete: typeof prismaMock.post.delete };
				}) => Promise<void>,
			) =>
				callback({
					comment: { deleteMany: prismaMock.comment.deleteMany },
					post: { delete: prismaMock.post.delete },
				}),
		);

		await expect(PostModel.delete("post-1")).resolves.toBe(true);

		expect(prismaMock.comment.deleteMany).toHaveBeenCalledWith({
			where: { postId: "post-1" },
		});
		expect(prismaMock.post.delete).toHaveBeenCalledWith({
			where: { id: "post-1" },
		});
	});

	test("PostModel reports false when transactional delete fails", async () => {
		prismaMock.$transaction.mockRejectedValue(new Error("delete failed"));

		await expect(PostModel.delete("post-1")).resolves.toBe(false);
	});

	test("CommentModel reads comments by post and user", async () => {
		prismaMock.comment.findMany.mockResolvedValue([]);

		await expect(CommentModel.readAllByPostId("post-1")).resolves.toEqual([]);
		await expect(CommentModel.readAllByUserId("user-1")).resolves.toEqual([]);

		expect(prismaMock.comment.findMany).toHaveBeenNthCalledWith(1, {
			where: { postId: "post-1" },
			include: {
				user: {
					select: {
						name: true,
					},
				},
			},
		});
		expect(prismaMock.comment.findMany).toHaveBeenNthCalledWith(2, {
			where: { userId: "user-1" },
			include: {
				post: {
					select: {
						slug: true,
					},
				},
			},
		});
	});

	test("CategoryModel reads a category by name and lists all sorted by name", async () => {
		const category = { id: "category-1", name: "Backend", slug: "backend" };
		prismaMock.category.findUnique.mockResolvedValue(category);
		prismaMock.category.findMany.mockResolvedValue([category]);

		await expect(CategoryModel.readByName("Backend")).resolves.toBe(category);
		await expect(CategoryModel.readAll()).resolves.toEqual([category]);

		expect(prismaMock.category.findUnique).toHaveBeenCalledWith({
			where: { name: "Backend" },
		});
		expect(prismaMock.category.findMany).toHaveBeenCalledWith({
			orderBy: { name: "asc" },
		});
	});

	test("TagModel reads a tag by name and lists all sorted by name", async () => {
		const tag = { id: "tag-1", name: "prisma", slug: "prisma" };
		prismaMock.tag.findUnique.mockResolvedValue(tag);
		prismaMock.tag.findMany.mockResolvedValue([tag]);

		await expect(TagModel.readByName("prisma")).resolves.toBe(tag);
		await expect(TagModel.readAll()).resolves.toEqual([tag]);

		expect(prismaMock.tag.findUnique).toHaveBeenCalledWith({
			where: { name: "prisma" },
		});
		expect(prismaMock.tag.findMany).toHaveBeenCalledWith({
			orderBy: { name: "asc" },
		});
	});

	test("SessionModel reads sessions by access and refresh tokens", async () => {
		prismaMock.session.findFirst.mockResolvedValue(null);

		await expect(SessionModel.readByAccessToken("access")).resolves.toBeNull();
		await expect(
			SessionModel.readByRefreshToken("refresh"),
		).resolves.toBeNull();

		expect(prismaMock.session.findFirst).toHaveBeenNthCalledWith(1, {
			where: { accessToken: "access" },
		});
		expect(prismaMock.session.findFirst).toHaveBeenNthCalledWith(2, {
			where: { refreshToken: "refresh" },
		});
	});

	test("ResetTokenModel reads tokens by token and user id", async () => {
		prismaMock.resetToken.findUnique.mockResolvedValue(null);
		prismaMock.resetToken.findFirst.mockResolvedValue(null);

		await expect(ResetTokenModel.readByToken("token")).resolves.toBeNull();
		await expect(ResetTokenModel.readByUserId("user-1")).resolves.toBeNull();

		expect(prismaMock.resetToken.findUnique).toHaveBeenCalledWith({
			where: { token: "token" },
		});
		expect(prismaMock.resetToken.findFirst).toHaveBeenCalledWith({
			where: { userId: "user-1" },
		});
	});

	test("VerifyTokenModel reads tokens by token and user id", async () => {
		prismaMock.verificationToken.findUnique.mockResolvedValue(null);
		prismaMock.verificationToken.findFirst.mockResolvedValue(null);

		await expect(VerifyTokenModel.readByToken("token")).resolves.toBeNull();
		await expect(VerifyTokenModel.readByUserId("user-1")).resolves.toBeNull();

		expect(prismaMock.verificationToken.findUnique).toHaveBeenCalledWith({
			where: { token: "token" },
		});
		expect(prismaMock.verificationToken.findFirst).toHaveBeenCalledWith({
			where: { userId: "user-1" },
		});
	});
});
