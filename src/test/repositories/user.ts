import { BaseModel } from "@/server/models/base";
import { IUserEntity, IUserModel } from "@/server/models/user";
import { InMemoryDelegate } from "./inMemoryDelegate";

class FakeUserModel extends BaseModel<IUserEntity> implements IUserModel {
  private readonly memory: InMemoryDelegate<IUserEntity>;

  constructor() {
    const memory = new InMemoryDelegate<IUserEntity>();

    super(memory);

    this.memory = memory;
  }

  async readByEmail(email: string): Promise<IUserEntity | null> {
    const users = await this.memory.findMany((user) => user.email === email);

    return users[0] ?? null;
  }
}

export { FakeUserModel };
