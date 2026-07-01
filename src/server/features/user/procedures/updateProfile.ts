import { UpdateUserProfileService } from "../domain/updateProfile";
import { IProtectedAPIContextDTO } from "@/server/createContext";
import { UpdateUserProfileInput } from "../schema";

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

export { updateUserProfileController };
