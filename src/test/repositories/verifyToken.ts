import { BaseModel } from "@/server/models/base";
import {
	IVerifyTokenEntity,
	IVerifyTokenModel,
} from "@/server/models/verifyToken";
import { InMemoryDelegate } from "./inMemoryDelegate";

class FakeVerifyTokenModel
	extends BaseModel<IVerifyTokenEntity>
	implements IVerifyTokenModel
{
	private readonly memory: InMemoryDelegate<IVerifyTokenEntity>;

	constructor() {
		const memory = new InMemoryDelegate<IVerifyTokenEntity>();

		super(memory);

		this.memory = memory;
	}

	async readByToken(token: string): Promise<IVerifyTokenEntity | null> {
		const tokens = await this.memory.findMany((entry) => entry.token === token);

		return tokens[0] ?? null;
	}

	async readByUserId(userId: string): Promise<IVerifyTokenEntity | null> {
		const tokens = await this.memory.findMany(
			(entry) => entry.userId === userId,
		);

		return tokens[0] ?? null;
	}
}

export { FakeVerifyTokenModel };
