import { BaseModel } from "@/server/models/base";
import {
	ICommentEntity,
	ICommentEntityWithUser,
	ICommentModel,
} from "@/server/models/comment";
import { IUserModel } from "@/server/models/user";
import { InMemoryDelegate } from "./inMemoryDelegate";

class FakeCommentModel
	extends BaseModel<ICommentEntity>
	implements ICommentModel
{
	private readonly memory: InMemoryDelegate<ICommentEntity>;

	constructor(private readonly userModel: IUserModel) {
		const memory = new InMemoryDelegate<ICommentEntity>();

		super(memory);

		this.memory = memory;
	}

	async readAllByPostId(
		postId: string,
	): Promise<ICommentEntityWithUser[] | null> {
		const comments = await this.memory.findMany(
			(comment) => comment.postId === postId,
		);

		return Promise.all(
			comments.map(async (comment) => {
				const user = await this.userModel.read(comment.userId);

				return { ...comment, user: { name: user?.name ?? "" } };
			}),
		);
	}

	async readAllByUserId(userId: string): Promise<ICommentEntity[] | null> {
		return this.memory.findMany((comment) => comment.userId === userId);
	}
}

export { FakeCommentModel };
