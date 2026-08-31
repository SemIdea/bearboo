import { IReferrerBucket } from "@/lib/referrerClassifier/adapter";
import { prisma } from "@/server/infra/drivers/prisma";
import { BaseModel } from "./base";

type IPostViewEntity = {
	id: string;
	postId: string;
	referrerBucket: IReferrerBucket;
	userAgent: string;
	createdAt: Date;
};

const sinceDate = (days: number): Date =>
	new Date(Date.now() - days * 24 * 60 * 60 * 1000);

class PostViewModelClass extends BaseModel<IPostViewEntity> {
	constructor() {
		super(prisma.postView);
	}

	async countSince(days: number): Promise<number> {
		return prisma.postView.count({
			where: { createdAt: { gte: sinceDate(days) } },
		});
	}

	async readReferrerBreakdown(
		days: number,
	): Promise<{ bucket: IReferrerBucket; count: number }[]> {
		const groups = await prisma.postView.groupBy({
			by: ["referrerBucket"],
			where: { createdAt: { gte: sinceDate(days) } },
			_count: { referrerBucket: true },
		});

		return groups.map(
			(group: {
				referrerBucket: IReferrerBucket;
				_count: { referrerBucket: number };
			}) => ({
				bucket: group.referrerBucket,
				count: group._count.referrerBucket,
			}),
		);
	}

	async readUserAgents(days: number): Promise<string[]> {
		const rows = await prisma.postView.findMany({
			where: { createdAt: { gte: sinceDate(days) } },
			select: { userAgent: true },
		});

		return rows.map((row: { userAgent: string }) => row.userAgent);
	}

	async deleteOlderThan(days: number): Promise<void> {
		await prisma.postView.deleteMany({
			where: { createdAt: { lt: sinceDate(days) } },
		});
	}
}

type IPostViewModel = BaseModel<IPostViewEntity> & {
	countSince: (days: number) => Promise<number>;
	readReferrerBreakdown: (
		days: number,
	) => Promise<{ bucket: IReferrerBucket; count: number }[]>;
	readUserAgents: (days: number) => Promise<string[]>;
	deleteOlderThan: (days: number) => Promise<void>;
};

const PostViewModel = new PostViewModelClass();

export type { IPostViewEntity, IPostViewModel };
export { PostViewModel };
