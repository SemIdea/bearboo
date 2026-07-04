import { DomainInput } from "@/server/createDomain";
import { UpdateUserProfileInput } from "../schema";

const domain_updateUserProfile = async ({
  ctx,
  input
}: DomainInput<UpdateUserProfileInput & { id: string }>) => {
  const updatedProfile = await ctx.repositories.user.update(input.id, {
    name: input.name,
    email: input.email,
    bio: input.bio
  });

  return updatedProfile;
};

export { domain_updateUserProfile };
