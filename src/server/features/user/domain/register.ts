import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { UserErrorCode } from "@/shared/error/user";
import { CreateUserInput } from "../schema";

type Input = DomainInput<CreateUserInput>;

const RegisterUserService = async ({ ctx, ...data }: Input) => {
  const existingUser = await ctx.repositories.user.readByEmail(data.email);

  if (existingUser) {
    throw new TRPCError({
      code: "CONFLICT",
      message: UserErrorCode.USER_ALREADY_EXISTS
    });
  }

  const userId = ctx.helpers.uid.generate();
  const hashedPassword = await ctx.helpers.hashing.hash(data.password);

  const user = await ctx.repositories.user.create(userId, {
    ...data,
    password: hashedPassword,
    verified: false
  });

  return user;
};

export { RegisterUserService };
