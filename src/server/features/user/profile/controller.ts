import { ReadUserProfileService, UpdateUserProfileService } from "./service";
import {
  IAPIContextDTO,
  IProtectedAPIContextDTO
} from "@/server/createContext";
import {
  ReadUserProfileInput,
  UpdateUserProfileInput
} from "@/server/schema/user.schema";

const readUserProfileController = async ({
  input,
  ctx
}: {
  input: ReadUserProfileInput;
  ctx: IAPIContextDTO;
}) => {
  if (ctx.user && input.id == ctx.user.id) {
    const { session, ...userWithoutSession } = ctx.user;

    return userWithoutSession;
  }

  const profile = await ReadUserProfileService({
    ...input,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.user
    }
  });

  return profile;
};

const updateUserProfileController = async ({
  input,
  ctx
}: {
  input: UpdateUserProfileInput;
  ctx: IProtectedAPIContextDTO;
}) => {
  const updatedProfile = await UpdateUserProfileService({
    ...input,
    id: ctx.user.id,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.user
    }
  });

  return updatedProfile;
};

export { readUserProfileController, updateUserProfileController };
