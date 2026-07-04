import { BaseModel } from "@/server/models/base";
import { ICommentModel } from "@/server/models/comment";
import {
	IPostEntity,
	IPostEntityWithRelations,
	IPostModel,
} from "@/server/models/post";
import { IUserModel } from "@/server/models/user";
import { InMemoryDelegate } from "./inMemoryDelegate";

class FakePostModel extends BaseModel<IPostEntity> implements IPostModel {
	private readonly memory: InMemoryDelegate<IPostEntity>;

	constructor(
		private readonly userModel: IUserModel,
		private readonly commentModel: ICommentModel,
	) {
		const memory = new InMemoryDelegate<IPostEntity>();

		super(memory);

		this.memory = memory;
	}

	async readRecents(count: number): Promise<IPostEntityWithRelations[]> {
		const posts = await this.memory.findMany();
		const recents = [...posts]
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
			.slice(0, count);

		return Promise.all(
			recents.map(async (post) => {
				const user = await this.userModel.read(post.userId);
				const comments =
					(await this.commentModel.readAllByPostId(post.id)) ?? [];

				return {
					...post,
					user: { id: post.userId, name: user?.name ?? "" },
					comments: comments.map((comment) => ({ id: comment.id })),
				};
			}),
		);
	}

	async readUserPosts(userId: string): Promise<IPostEntity[]> {
		return this.memory.findMany((post) => post.userId === userId);
	}

	async delete(id: string): Promise<boolean> {
		const comments = (await this.commentModel.readAllByPostId(id)) ?? [];

		await Promise.all(
			comments.map((comment) => this.commentModel.delete(comment.id)),
		);

		return super.delete(id);
	}
}

export { FakePostModel };
