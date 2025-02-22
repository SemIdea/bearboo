import { IRegisterUserDTO } from "./DTO";
import { GenerateSnowflakeUID } from "@/server/drivers/snowflake";
import { UserEntity } from "@/server/entities/user/entity";

const RegisterUserService = async ({
  repositories,
  ...data
}: IRegisterUserDTO) => {
  const { email, password } = data;

  const existingUser = await UserEntity.findByEmail({
    email,
    repositories,
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const userId = await GenerateSnowflakeUID();
  const hashedPassword = await repositories.hashing.hash(password);

  const user = await UserEntity.create({
    data: {
      email,
      password: hashedPassword,
    },
    id: userId,
    repositories,
  });

  return user;
};

export { RegisterUserService };
