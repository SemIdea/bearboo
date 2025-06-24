import { GetUserProfileService } from "./service";
import { IAPIContextDTO } from "@/server/createContext";
import { ReadUserProfileInput } from "@/server/schema/user.schema";

const getUserProfileController = async ({
  input,
  ctx
}: {
  input: ReadUserProfileInput;
  ctx: IAPIContextDTO;
}) => {
  if (ctx.user && input.userId == ctx.user.id) {
    const { session, ...userWithoutSession } = ctx.user;

    return userWithoutSession;
  }

  const profile = await GetUserProfileService({
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.user
    },
    userId: input.userId
  });

  return profile;
};

export { getUserProfileController };
