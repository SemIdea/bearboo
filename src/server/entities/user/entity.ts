import { IUserModel, IUserEntity } from "./DTO";

class UserEntity implements IUserEntity {
  constructor(
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
    // try {
    //   console.log(data)
    //   userSchema.parse(data);
    // } catch (error) {
    //   if (error instanceof ZodError) {
    //     throw new Error(
    //       `Validation failed: ${error.errors.map((e) => e.message).join(", ")}`
    //     );
    //   }
    //   throw error;
    // }

    const { email, password } = data;
    const newUser = new UserEntity(email, password);

    const user = await repositories.database.create(id, newUser);

    return user;
  }
}

export { UserEntity };
