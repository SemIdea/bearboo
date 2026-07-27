import { revalidateTag } from "next/cache";
import { DomainInput } from "@/server/createDomain";
import { IRole } from "@/server/models/user";
import { DomainError } from "@/shared/error/domainError";
import { DeletePostInput } from "../schema";

const domain_deletePost = async ({
	ctx,
	input,
}: DomainInput<DeletePostInput & { userId: string; role: IRole }>) => {
	const post = await ctx.repositories.post.read(input.id);

	if (!post) {
		throw new DomainError("post.not_found");
	}

	const isOwner = post.userId === input.userId;
	const canDeleteAny = ctx.helpers.permissions.can(
		input.role,
		"post:deleteAny",
	);

	if (!isOwner && !canDeleteAny) {
		throw new DomainError("post.delete_forbidden");
	}

	const deleted = await ctx.repositories.post.delete(post.id);

	revalidateTag("posts", "hours");

	return deleted;
};

export { domain_deletePost };
