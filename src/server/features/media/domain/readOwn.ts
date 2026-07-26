import { DomainInput } from "@/server/createDomain";
import { IRole } from "@/server/models/user";

const domain_readOwnMedia = async ({
	ctx,
	input,
}: DomainInput<{ userId: string; role: IRole }>) => {
	const canReadAny = ctx.helpers.permissions.can(input.role, "media:deleteAny");

	return ctx.repositories.media.readByUser(canReadAny ? null : input.userId);
};

export { domain_readOwnMedia };
