import { ZodError } from "zod";
import { IUserModel, IUserEntity } from "./DTO";
import { verifyUserSchema } from "@/server/schema/user.schema";

class UserEntity implements IUserEntity {
  constructor(
    public id: string,
    public email: string,
    public password: string,
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
      cache: any;
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

    return user;
  }
}

export { UserEntity };
