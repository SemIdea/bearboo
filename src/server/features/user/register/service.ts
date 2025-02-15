import { IRegisterUserDTO } from "./DTO";

import { UserEntity } from "@/server/entities/user/entity";

const RegisterUserService = async ({
  repositories,
  ...data
}: IRegisterUserDTO) => {
  const { email, password } = data;
  const userId = Date.now().toString();

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
