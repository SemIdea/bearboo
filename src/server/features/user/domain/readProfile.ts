import { DomainInput } from "@/server/createDomain";
import { ReadUserProfileInput } from "../schema";
import { domain_getUserOrThrow } from "./getUserOrThrow";

const domain_readUserProfile = async ({
	ctx,
	input,
}: DomainInput<ReadUserProfileInput>) => {
	const userProfile = await domain_getUserOrThrow({
		ctx,
		input: { id: input.id },
	});

	return {
		id: userProfile.id,
		name: userProfile.name,
		email: userProfile.email,
		verified: userProfile.verified,
		role: userProfile.role,
		createdAt: userProfile.createdAt,
		updatedAt: userProfile.updatedAt,
		bio: userProfile.bio,
	};
};

export { domain_readUserProfile };
