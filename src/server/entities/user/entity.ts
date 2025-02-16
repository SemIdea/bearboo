import { ZodError } from "zod";
import { IUserModel, IUserEntity } from "./DTO";
import { verifyUserSchema } from "@/server/schema/user.schema";
import { ICacheRepositoryAdapter } from "@/server/integrations/helpers/cache/adapter";

class UserEntity implements IUserEntity {
  constructor(
    public id: string,
    public email: string,
    public password: string
  ) {}

  static async create({
    id,
    data,
    repositories,
  }: {
    id: string;
    data: {
      email: string;
      password: string;
    };
    repositories: {
      database: IUserModel;
      cache: ICacheRepositoryAdapter;
    };
  }) {
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
    await repositories.cache.set(`user:${id}`, JSON.stringify(user), 60 * 15);

    return user;
  }

  static async findByEmail({
    email,
    repositories,
  }: {
    email: string;
    repositories: {
      database: IUserModel;
      cache: ICacheRepositoryAdapter;
    };
  }) {
    const cachedUser = await repositories.cache.get(`user:email:${email}`);
    if (cachedUser) return JSON.parse(cachedUser);

    const user = await repositories.database.findByEmail(email);
    if (!user) return null;

    await repositories.cache.set(
      `user:email:${email}`,
      JSON.stringify(user),
      60 * 15
    );

    return user;
  }
}

export { UserEntity };
