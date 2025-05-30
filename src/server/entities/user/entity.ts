import { ZodError } from "zod";
import {
  IUserEntity,
  ICreateUserDTO,
  IFindUserDTO,
  IFindUserByEmailDTO,
  ICacheUserDTO,
  IResolveUserFromIndexDTO,
} from "./DTO";
import { verifyUserSchema } from "@/server/schema/user.schema";
import {
  userCacheKey,
  UserCacheTTL,
  userEmailCacheKey,
} from "@/constants/cache/user";

class UserEntity implements IUserEntity {
  private static shouldCacheUser = true;
  constructor(
    public id: string,
    public email: string,
    public password: string,
  ) {}

  private static async cacheUser({
    user,
    repositories,
  }: ICacheUserDTO): Promise<void> {
    if (!UserEntity.shouldCacheUser) return;
    const { id, email } = user;

    await repositories.cache.mset(
      [userCacheKey(id), userEmailCacheKey(email)],
      [JSON.stringify(user), id],
      UserCacheTTL,
    );
  }

  private static async resolveUserFromIndex({
    indexKey,
    indexKeyCaller,
    findOnDatabase,
    repositories,
  }: IResolveUserFromIndexDTO) {
    const lookupCacheKey = indexKeyCaller(indexKey);
    const cachedIndexValue = await repositories.cache.get(lookupCacheKey);

    if (cachedIndexValue) {
      try {
        const maybeUser = JSON.parse(cachedIndexValue) as UserEntity;

        if (maybeUser.id) return maybeUser;
      } catch {
        const fallbackCacheKey = userCacheKey(cachedIndexValue);
        const fallbackCachedUser =
          await repositories.cache.get(fallbackCacheKey);

        if (fallbackCachedUser)
          return JSON.parse(fallbackCachedUser) as UserEntity;
      }
    }

    const userFromDb = await findOnDatabase(indexKey);

    if (!userFromDb) return null;

    await UserEntity.cacheUser({
      user: userFromDb,
      repositories,
    });

    return userFromDb;
  }

  static async create({ id, data, repositories }: ICreateUserDTO) {
    const { email, password } = data;
    const newUser = new UserEntity(id, email, password);

    try {
      verifyUserSchema.parse(newUser);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(
          `Validation failed: ${error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
        );
      }
      throw error;
    }

    const user = await repositories.database.create(id, newUser);

    await UserEntity.cacheUser({
      user,
      repositories,
    });

    return user;
  }

  static async find({
    id,
    repositories,
  }: IFindUserDTO): Promise<UserEntity | null> {
    return await UserEntity.resolveUserFromIndex({
      indexKey: id,
      indexKeyCaller: userCacheKey,
      findOnDatabase: repositories.database.find,
      repositories,
    });
  }

  static async findByEmail({
    email,
    repositories,
  }: IFindUserByEmailDTO): Promise<UserEntity | null> {
    return await UserEntity.resolveUserFromIndex({
      indexKey: email,
      indexKeyCaller: userEmailCacheKey,
      findOnDatabase: repositories.database.findByEmail,
      repositories,
    });
  }
}

export { UserEntity };
