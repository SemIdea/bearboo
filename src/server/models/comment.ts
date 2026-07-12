import { prisma } from "@/server/infra/drivers/prisma";
import { BaseModel } from "./base";

type ICommentEntity = {
	id: string;
	postId: string;
	userId: string;
	content: string;
	createdAt: Date;
	updatedAt: Date;
};

type ICommentEntityWithUser = ICommentEntity & {
	user: {
		name: string;
	};
};

type ICommentEntityWithPost = ICommentEntity & {
	post: {
		slug: string;
	};
};

class CommentModelClass extends BaseModel<ICommentEntity> {
	constructor() {
		super(prisma.comment);
	}

	async readAllByPostId(
		postId: string,
	): Promise<ICommentEntityWithUser[] | null> {
		return prisma.comment.findMany({
			where: {
				postId,
			},
			include: {
				user: {
					select: {
						name: true,
					},
				},
			},
		});
	}

	async readAllByUserId(
		userId: string,
	): Promise<ICommentEntityWithPost[] | null> {
		return prisma.comment.findMany({
			where: {
				userId,
			},
			include: {
				post: {
					select: {
						slug: true,
					},
				},
			},
		});
	}
}

const CommentModel = new CommentModelClass();

type ICommentModel = BaseModel<ICommentEntity> & {
	readAllByPostId: (postId: string) => Promise<ICommentEntityWithUser[] | null>;
	readAllByUserId: (userId: string) => Promise<ICommentEntityWithPost[] | null>;
};

export type {
	ICommentEntity,
	ICommentEntityWithPost,
	ICommentEntityWithUser,
	ICommentModel,
};
export { CommentModel };
