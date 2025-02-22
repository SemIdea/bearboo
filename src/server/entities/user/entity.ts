import { ZodError } from "zod";
import {
  IUserEntity,
  ICreateUserDTO,
  IFindUserDTO,
  IFindUserByEmailDTO,
} from "./DTO";
import { verifyUserSchema } from "@/server/schema/user.schema";

class UserEntity implements IUserEntity {
  constructor(
    public id: string,
    public email: string,
    public password: string,
  ) {}

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

    await repositories.cache.set(`user:${id}`, JSON.stringify(user), 60 * 15);

    return user;
  }

  static async find({
    id,
    repositories,
  }: IFindUserDTO): Promise<UserEntity | null> {
    const cachedUser = await repositories.cache.get(`user:${id}`);

    if (cachedUser) return JSON.parse(cachedUser);

    const user = await repositories.database.read(id);

    if (!user) return null;

    await repositories.cache.set(`user:${id}`, JSON.stringify(user), 60 * 15);

    return user;
  }

  static async findByEmail({ email, repositories }: IFindUserByEmailDTO) {
    const cachedUser = await repositories.cache.get(`user:email:${email}`);

    if (cachedUser) return JSON.parse(cachedUser);

    const user = await repositories.database.findByEmail(email);

    if (!user) return null;

    await repositories.cache.set(
      `user:email:${email}`,
      JSON.stringify(user),
      60 * 15,
    );

    return user;
  }
}

export { UserEntity };
