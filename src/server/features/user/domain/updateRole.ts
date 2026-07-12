import { DomainInput } from "@/server/createDomain";
import { UpdateUserRoleInput } from "../schema";
import { domain_getUserOrThrow } from "./getUserOrThrow";

const domain_updateUserRole = async ({
	ctx,
	input,
}: DomainInput<UpdateUserRoleInput>) => {
	await domain_getUserOrThrow({ ctx, input: { id: input.userId } });

	return ctx.repositories.user.update(input.userId, { role: input.role });
};

export { domain_updateUserRole };
