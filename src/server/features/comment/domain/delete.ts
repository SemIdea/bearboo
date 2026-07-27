import { DomainInput } from "@/server/createDomain";
import { DomainError } from "@/shared/error/domainError";
import { DeleteCommentInput } from "../schema";

const domain_deleteComment = async ({
	ctx,
	input,
}: DomainInput<DeleteCommentInput & { userId: string }>) => {
	const comment = await ctx.repositories.comment.read(input.id);

	if (!comment) {
		throw new DomainError("comment.not_found");
	}

	if (comment.userId !== input.userId) {
		throw new DomainError("comment.delete_forbidden");
	}

	return ctx.repositories.comment.delete(input.id);
};

export { domain_deleteComment };
