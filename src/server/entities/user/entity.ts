import { ZodError } from "zod";
import {
  IUserEntity,
  ICreateUserDTO,
  IFindUserDTO,
  IFindUserByEmailDTO,
} from "./DTO";
import { verifyUserSchema } from "@/server/schema/user.schema";
import {
  userCacheKey,
  UserCacheTTL,
  userEmailCacheKey,
} from "@/constants/cache/user";

class UserEntity implements IUserEntity {
  constructor(
    public id: string,
    public email: string,
    public password: string
  ) {}

  static async create({ id, data, repositories }: ICreateUserDTO) {
    const cachedUserKey = userCacheKey(id);
    const { email, password } = data;
    const newUser = new UserEntity(id, email, password);

    try {
      verifyUserSchema.parse(newUser);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(
          `Validation failed: ${error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`
        );
      }
      throw error;
    }

    const user = await repositories.database.create(id, newUser);

    await repositories.cache.set(
      cachedUserKey,
      JSON.stringify(user),
      UserCacheTTL
    );

    return user;
  }

  static async find({
    id,
    repositories,
  }: IFindUserDTO): Promise<UserEntity | null> {
    const cachedUserKey = userCacheKey(id);
    const cachedUser = await repositories.cache.get(cachedUserKey);

    if (cachedUser) return JSON.parse(cachedUser);

    const user = await repositories.database.find(id);

    if (!user) return null;

    await repositories.cache.set(
      cachedUserKey,
      JSON.stringify(user),
      UserCacheTTL
    );

    return user;
  }

  static async findByEmail({
    email,
    repositories,
  }: IFindUserByEmailDTO): Promise<UserEntity | null> {
    const cachedUserKey = userEmailCacheKey(email);
    const cachedUser = await repositories.cache.get(cachedUserKey);

    if (cachedUser) return JSON.parse(cachedUser);

    const user = await repositories.database.findByEmail(email);

    if (!user) return null;

    await repositories.cache.set(
      cachedUserKey,
      JSON.stringify(user),
      UserCacheTTL
    );

    return user;
  }
}

export { UserEntity };
