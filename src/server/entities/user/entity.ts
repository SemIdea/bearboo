import { BaseEntity } from "../base/entity";
import { IUserEntity, IReadUserByEmailDTO, IUserModel } from "./DTO";
import {
  userCacheKey,
  UserCacheTTL,
  userEmailCacheKey
} from "@/constants/cache/user";

class UserEntityClass extends BaseEntity<IUserEntity, IUserModel> {
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
      cache: {
        key: userCacheKey("%id%"),
        ttl: UserCacheTTL
      },
      index: {
        email: {
          key: userEmailCacheKey("%email%"),
          ttl: UserCacheTTL
        }
      }
    });
  }
}

const UserEntity = new UserEntityClass();

export { UserEntity };
