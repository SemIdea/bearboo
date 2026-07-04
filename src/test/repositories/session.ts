import { BaseModel } from "@/server/models/base";
import { ISessionEntity, ISessionModel } from "@/server/models/session";
import { InMemoryDelegate } from "./inMemoryDelegate";

class FakeSessionModel
	extends BaseModel<ISessionEntity>
	implements ISessionModel
{
	private readonly memory: InMemoryDelegate<ISessionEntity>;

	constructor() {
		const memory = new InMemoryDelegate<ISessionEntity>();

		super(memory);

		this.memory = memory;
	}

	async readByAccessToken(accessToken: string): Promise<ISessionEntity | null> {
		const sessions = await this.memory.findMany(
			(session) => session.accessToken === accessToken,
		);

		return sessions[0] ?? null;
	}

	async readByRefreshToken(
		refreshToken: string,
	): Promise<ISessionEntity | null> {
		const sessions = await this.memory.findMany(
			(session) => session.refreshToken === refreshToken,
		);

		return sessions[0] ?? null;
	}
}

export { FakeSessionModel };
