import { DomainInput } from "@/server/createDomain";
import { ReadUserProfileInput } from "../schema";
import { domain_getUserOrThrow } from "./getUserOrThrow";

const domain_readUserProfile = async ({
  ctx,
  input
}: DomainInput<ReadUserProfileInput>) => {
  const userProfile = await domain_getUserOrThrow({
    ctx,
    input: { id: input.id }
  });

  const { password, ...userWithoutPassword } = userProfile;

  return userWithoutPassword;
};

export { domain_readUserProfile };
