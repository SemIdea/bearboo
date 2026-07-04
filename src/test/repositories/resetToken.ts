import { BaseModel } from "@/server/models/base";
import {
  IResetTokenEntity,
  IResetTokenModel
} from "@/server/models/resetToken";
import { InMemoryDelegate } from "./inMemoryDelegate";

class FakeResetTokenModel
  extends BaseModel<IResetTokenEntity>
  implements IResetTokenModel
{
  private readonly memory: InMemoryDelegate<IResetTokenEntity>;

  constructor() {
    const memory = new InMemoryDelegate<IResetTokenEntity>();

    super(memory);

    this.memory = memory;
  }

  async readByToken(token: string): Promise<IResetTokenEntity | null> {
    const tokens = await this.memory.findMany((entry) => entry.token === token);

    return tokens[0] ?? null;
  }

  async readByUserId(userId: string): Promise<IResetTokenEntity | null> {
    const tokens = await this.memory.findMany(
      (entry) => entry.userId === userId
    );

    return tokens[0] ?? null;
  }
}

export { FakeResetTokenModel };
