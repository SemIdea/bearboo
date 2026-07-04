import { beforeEach, describe, expect, test, vi } from "vitest";
import { CommentModel } from "../comment";
import { PostModel } from "../post";
import { ResetTokenModel } from "../resetToken";
import { SessionModel } from "../session";
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

	test("PostModel reads recent posts with author and comment metadata", async () => {
		const posts = [{ id: "post-1" }];
		prismaMock.post.findMany.mockResolvedValue(posts);

		await expect(PostModel.readRecents(5)).resolves.toBe(posts);

		expect(prismaMock.post.findMany).toHaveBeenCalledWith({
			take: 5,
			orderBy: { createdAt: "desc" },
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
	});

	test("PostModel reads posts by user", async () => {
		prismaMock.post.findMany.mockResolvedValue([]);

		await expect(PostModel.readUserPosts("user-1")).resolves.toEqual([]);

		expect(prismaMock.post.findMany).toHaveBeenCalledWith({
			where: { userId: "user-1" },
		});
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
