import { GetUserProfileService } from "./service";
import { IAPIContextDTO } from "@/server/createContext";
import { GetUserProfileInput } from "@/server/schema/user.schema";

const getUserProfileController = async ({
  input,
  ctx,
}: {
  input: GetUserProfileInput;
  ctx: IAPIContextDTO;
}) => {
  if (ctx.user && input.id == ctx.user.id) {
    const { session, ...userWithoutSession } = ctx.user;

    return userWithoutSession;
  }

  const profile = await GetUserProfileService({
    userId: input.id,
    repositories: {
      database: ctx.repositories.user,
      cache: ctx.repositories.cache,
    },
  });

  return profile;
};

export { getUserProfileController };
