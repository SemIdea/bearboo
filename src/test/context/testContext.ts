import { env } from "@/lib/env";
import { gateways, IGateways } from "@/server/infra/container/gateways";
import { helpers } from "@/server/infra/container/helpers";
import {
	IRepositories,
	repositories,
} from "@/server/infra/container/repositories";
import { ICategoryEntity } from "@/server/models/category";
import { ICommentEntity } from "@/server/models/comment";
import { IPostEntity } from "@/server/models/post";
import { ITagEntity } from "@/server/models/tag";
import { IAuthenticatedUserDTO } from "./types";

class TestContext {
	headers = new Headers();
	repositories: IRepositories;
	helpers = helpers;
	gateways: IGateways;
	env = env;
	user?: IAuthenticatedUserDTO;

	constructor(
		overrides: { repositories?: IRepositories; gateways?: IGateways } = {},
	) {
		this.repositories = overrides.repositories ?? repositories;
		this.gateways = overrides.gateways ?? gateways;
	}

	async createAuthenticatedUser() {
		const userId = this.helpers.uid.generate();
		const userData = {
			email: `${userId}@example.com`,
			name: "Test User",
			password: "password123",
		};

		const user = await this.repositories.user.create(userId, {
			...userData,
			password: await this.helpers.hashing.hash(userData.password),
			verified: true,
		});

		const sessionId = this.helpers.uid.generate();
		const accessToken = this.helpers.uid.generate();
		const refreshToken = this.helpers.uid.generate();

		const session = await this.repositories.session.create(sessionId, {
			userId: user.id,
			accessToken,
			refreshToken,
		});

		this.user = { ...user, truePassword: userData.password, session };
	}

	async createNewUser() {
		const userId = this.helpers.uid.generate();
		const userData = {
			email: `${userId}@example.com`,
			name: "Test User",
			password: "password123",
		};

		const user = await this.repositories.user.create(userId, {
			...userData,
			password: await this.helpers.hashing.hash(userData.password),
			verified: false,
		});

		return user;
	}

	async createPost(
		overrides: Partial<
			Pick<
				IPostEntity,
				"title" | "content" | "userId" | "slug" | "status" | "categoryId"
			>
		> & { tagIds?: string[] } = {},
	) {
		const postId = this.helpers.uid.generate();
		const userId = overrides.userId ?? this.user?.id;

		if (!userId) {
			throw new Error("User is not authenticated");
		}

		const post = await this.repositories.post.create(postId, {
			title: overrides.title ?? "Test Post",
			content: overrides.content ?? "This is a test post.",
			slug: overrides.slug ?? `test-post-${postId}`,
			status: overrides.status ?? "PUBLISHED",
			categoryId: overrides.categoryId ?? null,
			userId,
		});

		if (overrides.tagIds) {
			await this.repositories.post.setTags(postId, overrides.tagIds);
		}

		return post;
	}

	async createCategory(
		overrides: Partial<Pick<ICategoryEntity, "name" | "slug">> = {},
	) {
		const categoryId = this.helpers.uid.generate();
		const name = overrides.name ?? `Test Category ${categoryId}`;

		return this.repositories.category.create(categoryId, {
			name,
			slug: overrides.slug ?? this.helpers.slug.generate(name),
		});
	}

	async createTag(overrides: Partial<Pick<ITagEntity, "name" | "slug">> = {}) {
		const tagId = this.helpers.uid.generate();
		const name = overrides.name ?? `test-tag-${tagId}`;

		return this.repositories.tag.create(tagId, {
			name,
			slug: overrides.slug ?? this.helpers.slug.generate(name),
		});
	}

	async createComment(
		overrides: Partial<
			Pick<ICommentEntity, "postId" | "content" | "userId">
		> = {},
	) {
		const commentId = this.helpers.uid.generate();
		const userId = overrides.userId ?? this.user?.id;

		if (!userId) {
			throw new Error("User is not authenticated");
		}

		const postId = overrides.postId ?? (await this.createPost({ userId })).id;

		return this.repositories.comment.create(commentId, {
			postId,
			userId,
			content: overrides.content ?? "This is a test comment.",
		});
	}
}

export { TestContext };
