import { CreateUserInput } from "@/server/schema/user.schema";

const registerUserController = ({ input }: { input: CreateUserInput }) => {
  return {
    email: input.email,
    password: input.password,
  };
};

export { registerUserController };
