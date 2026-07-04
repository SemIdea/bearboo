import { DomainInput } from "@/server/createDomain";
import { UpdateUserProfileInput } from "../schema";

type Input = DomainInput<UpdateUserProfileInput & { id: string }>;

const UpdateUserProfileService = async ({ ctx, ...data }: Input) => {
  const updatedProfile = await ctx.repositories.user.update(data.id, {
    name: data.name,
    email: data.email,
    bio: data.bio
  });

  return updatedProfile;
};

export { UpdateUserProfileService };
