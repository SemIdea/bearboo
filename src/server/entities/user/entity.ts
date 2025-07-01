import { isFeatureEnabled } from "@/lib/featureFlags";
import { BaseEntity } from "../base/entity";
import { IUserEntity, IReadUserByEmailDTO, IUserModel } from "./DTO";
import { UserCacheTTL } from "@/constants/cache/user";

class UserEntityClass extends BaseEntity<
  IUserEntity,
  IUserModel,
  "user",
  "email"
> {
  async readByEmail({
    email,
    repositories
  }: IReadUserByEmailDTO): Promise<IUserEntity | null> {
    const cachedUser = await this.readCachedEntityByIndex({
      indexName: "email",
      indexValue: email,
      repositories
    });

    if (cachedUser) return cachedUser;

    const user = await repositories.database.readByEmail(email);

    if (!user) return null;

    await this.cacheEntity({
      data: user,
      repositories
    });

    return user;
  }

  constructor() {
    super({
      shouldCache: isFeatureEnabled("enableUserCaching"),
      cache: {
        key: "user:%id%",
        ttl: UserCacheTTL
      },
      index: {
        email: {
          key: "user:email:%email%",
          ttl: UserCacheTTL
        }
      }
    });
  }
}

const UserEntity = new UserEntityClass();

export { UserEntity };
