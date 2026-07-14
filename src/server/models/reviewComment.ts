import { prisma } from "@/server/infra/drivers/prisma";
import { BaseModel } from "./base";

type IReviewCommentType = "APPROVAL" | "REJECTION";

type IReviewCommentEntity = {
	id: string;
	postId: string;
	reviewerId: string;
	type: IReviewCommentType;
	content: string | null;
	createdAt: Date;
};

type IReviewCommentEntityWithReviewer = IReviewCommentEntity & {
	reviewer: {
		id: string;
		name: string;
	};
};

class ReviewCommentModelClass extends BaseModel<IReviewCommentEntity> {
	constructor() {
		super(prisma.postReviewComment);
	}

	async readAllByPostId(
		postId: string,
	): Promise<IReviewCommentEntityWithReviewer[]> {
		return prisma.postReviewComment.findMany({
			where: {
				postId,
			},
			orderBy: {
				createdAt: "desc",
			},
			include: {
				reviewer: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});
	}
}

const ReviewCommentModel = new ReviewCommentModelClass();

type IReviewCommentModel = BaseModel<IReviewCommentEntity> & {
	readAllByPostId: (
		postId: string,
	) => Promise<IReviewCommentEntityWithReviewer[]>;
};

export type {
	IReviewCommentEntity,
	IReviewCommentEntityWithReviewer,
	IReviewCommentModel,
	IReviewCommentType,
};
export { ReviewCommentModel };
